const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const checkDiskSpace = require('check-disk-space').default;
require('dotenv').config();

// Validate environment variables
const requiredEnvVars = ['BACKUP_DIR', 'MONGO_URI', 'GMAIL_USER', 'GMAIL_PASSWORD', 'ADMIN_EMAIL'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const BASE_BACKUP_DIR = path.resolve(process.env.BACKUP_DIR);
const MONGO_URI = process.env.MONGO_URI;
const STORAGE_THRESHOLD = Number(process.env.STORAGE_THRESHOLD);
if (isNaN(STORAGE_THRESHOLD) || STORAGE_THRESHOLD < 0 || STORAGE_THRESHOLD > 100) {
  throw new Error('Invalid STORAGE_THRESHOLD in environment variables');
}
const DRIVE_PATH = path.parse(BASE_BACKUP_DIR).root;

const FOLDERS = {
  weekly: 'weeklybackup',
  monthly: 'monthlybackup',
  quarterly: 'quarterlybackup',
};

// Ensure backup folders exist
Object.values(FOLDERS).forEach(sub => {
  const fullPath = path.join(BASE_BACKUP_DIR, sub);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Utility: Extract database name from URI
function getDatabaseName(uri) {
  const match = uri.match(/(?:\/)([^/?]+)(?:\?|$)/);
  return match ? match[1] : 'unknownDB';
}

// Alert when storage exceeds threshold or on backup/restore failure
function sendEmailAlert(subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Email error:', err.message);
    else console.log('📧 Alert sent:', info.response);
  });
}

async function checkStorageUsage() {
  try {
    const disk = await checkDiskSpace(DRIVE_PATH);
    const usedPercent = ((disk.size - disk.free) / disk.size) * 100;
    console.log(`💾 Storage used: ${usedPercent.toFixed(2)}%`);
    if (usedPercent > STORAGE_THRESHOLD) {
      sendEmailAlert('⚠️ Storage Alert', `Storage used: ${usedPercent.toFixed(2)}% exceeds threshold.`);
    }
  } catch (err) {
    console.error('❌ Storage check error:', err.message);
  }
}

function backupAndRestore(type) {
  const dbName = getDatabaseName(MONGO_URI);
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const folderName = FOLDERS[type];
  const backupName = `backup-${dbName}-${type}-${date}_${time}.gz`;
  const archivePath = path.join(BASE_BACKUP_DIR, folderName, backupName);

  // Explicitly print the backup storage path
  console.log(`💾 Backup will be stored at: ${archivePath}`);

  // Use explicit paths for mongodump and mongorestore
  const mongodumpPath = 'C:\\mongodb-tools\\bin\\mongodump.exe';
  const mongorestorePath = 'C:\\mongodb-tools\\bin\\mongorestore.exe';
  const command = `"${mongodumpPath}" --uri="${MONGO_URI}" --archive="${archivePath}" --gzip`;
  console.log(`📦 Running ${type} backup...`);

  exec(command, (error) => {
    if (error) {
      console.error(`❌ ${type} backup failed:`, error.message);
      sendEmailAlert('❌ Backup Failed', `Failed to create ${type} backup: ${error.message}`);
      return;
    }

    console.log(`✅ ${type} backup completed successfully.`);
    console.log(`💾 Backup stored at: ${archivePath}`);
    checkStorageUsage();

    // Schedule restore after 10 minutes
    setTimeout(() => {
      const restoreCommand = `"${mongorestorePath}" --uri="${MONGO_URI}" --archive="${archivePath}" --gzip --drop`;
      console.log(`🔁 Restoring ${type} backup from: ${archivePath}`);
      exec(restoreCommand, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Restore failed:`, err.message);
          console.error(stderr);
          sendEmailAlert('❌ Restore Failed', `Failed to restore ${type} backup: ${err.message}`);
        } else {
          console.log(`✅ Restore completed for ${type}`);
          console.log(stdout || stderr);
        }
      });
    }, 10 * 60 * 1000); // 10 minutes
  });
}

// CRON Schedules (run only if main module)
  // Weekly: Tuesday 10:00 AM
  cron.schedule('42 10 * * 2', () => {
    console.log('📅 Weekly backup triggered');
    backupAndRestore('weekly');
  });

  // cron.schedule('39 10 24 6 *', () => {
  //   console.log('📅 Test weekly backup triggered at 10:31 AM IST');
  //   backupAndRestore('weekly');
  // }, { timezone: 'Asia/Kolkata' });

  // Monthly: 1st 10:00 AM
  cron.schedule('0 10 1 * *', () => {
    console.log('📅 Monthly backup triggered');
    backupAndRestore('monthly');
  }, { timezone: 'Asia/Kolkata' });

  // Quarterly: 1st of Jan, Apr, Jul, Oct at 10:00 AM
  cron.schedule('0 10 1 1,4,7,10 *', () => {
    console.log('📅 Quarterly backup triggered');
    backupAndRestore('quarterly');
  }, { timezone: 'Asia/Kolkata' });

  console.log('🚀 Backup & Restore scheduler running...');

// Export the backup function
module.exports = backupAndRestore;
// Trigger weekly backup immediately
