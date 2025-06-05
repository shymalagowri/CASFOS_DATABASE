const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const checkDiskSpace = require('check-disk-space').default;
require('dotenv').config();

const BASE_BACKUP_DIR = path.resolve(process.env.BACKUP_DIR);
const MONGO_URI = process.env.MONGO_URI;
const STORAGE_THRESHOLD = parseInt(process.env.STORAGE_THRESHOLD) || 80;
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

// Alert when storage exceeds threshold
function sendEmailAlert(usedPercent) {
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
    subject: '⚠️ Storage Alert',
    text: `Storage used: ${usedPercent.toFixed(2)}% exceeds threshold.`,
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
    if (usedPercent > STORAGE_THRESHOLD) sendEmailAlert(usedPercent);
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

  const command = `mongodump --uri="${MONGO_URI}" --archive="${archivePath}" --gzip`;
  console.log(`📦 Running ${type} backup: ${archivePath}`);

  exec(command, (error) => {
    if (error) {
      console.error(`❌ ${type} backup failed:`, error.message);
      return;
    }

    console.log(`✅ ${type} backup completed.`);
    checkStorageUsage();

    // Schedule restore after 10 minutes (600,000 ms)
    setTimeout(() => {
      const restoreCommand = `mongorestore --uri="${MONGO_URI}" --archive="${archivePath}" --gzip --drop`;
      console.log(`🔁 Restoring ${type} backup: ${archivePath}`);
      exec(restoreCommand, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Restore failed:`, err.message);
          console.error(stderr);
        } else {
          console.log(`✅ Restore completed for ${type}`);
          console.log(stdout || stderr);
        }
      });
    }, 10 * 60 * 1000); // 10 minutes 10 * 60 * 1000
  });
}

module.exports=backupAndRestore
// CRON Schedules
// Weekly: Monday 10:00 AM
cron.schedule('0 10 * * 1', () => {
  console.log('📅 Weekly backup triggered');
  backupAndRestore('weekly');
});

// Monthly: 1st 10:00 AM
cron.schedule('0 10 1 * *', () => {
  console.log('📅 Monthly backup triggered');
  backupAndRestore('monthly');
});

// Quarterly: 1st of Jan, Apr, Jul, Oct at 10:00 AM
cron.schedule('0 10 1 1,4,7,10 *', () => {
  console.log('📅 Quarterly backup triggered');
  backupAndRestore('quarterly');
});


console.log('🚀 Backup & Restore scheduler running...');

