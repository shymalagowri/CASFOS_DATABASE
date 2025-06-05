const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');

// Determine base path (handles asar packaging)
const basePath = app.isPackaged
  ? path.join(path.dirname(app.getAppPath()), '..', 'resources')
  : __dirname;

// Load environment variables
const serverEnvPath = path.join(basePath, app.isPackaged ? 'server/.env' : '../server/.env');
const clientEnvPath = path.join(basePath, app.isPackaged ? 'client/.env' : '../client/.env');

const serverEnv = fs.existsSync(serverEnvPath) 
  ? dotenv.config({ path: serverEnvPath }).parsed || {}
  : {};
const clientEnv = fs.existsSync(clientEnvPath)
  ? dotenv.config({ path: clientEnvPath }).parsed || {}
  : {};

const SERVER_IP = serverEnv.IP || 'localhost';
const CLIENT_IP = clientEnv.IP || 'localhost';
const isDev = !app.isPackaged;

let mainWindow;
let viteProcess;
let serverProcess;

async function createWindow(clientUrl) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(basePath, app.isPackaged ? 'assets/app-icon.ico' : 'electron/assets/app-icon.ico')
  });

  console.log(`Loading client URL: ${clientUrl}`);
  try {
    await mainWindow.loadURL(clientUrl);
  } catch (err) {
    console.error('Failed to load URL:', err);
    dialog.showErrorBox('Load Error', `Failed to load the client URL: ${err.message}`);
    app.quit();
    return;
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startServer() {
  const SERVER_PORT = serverEnv.PORT || 3050;
  const SERVER_URL = `http://${SERVER_IP}:${SERVER_PORT}`;
  console.log(`Server URL: ${SERVER_URL}`);

  const serverPath = path.join(basePath, app.isPackaged ? 'server/index.js' : '../server/index.js');
  
  // Ensure server file exists
  if (!fs.existsSync(serverPath)) {
    const error = `Server file not found at: ${serverPath}`;
    console.error(error);
    dialog.showErrorBox('Server Error', error);
    app.quit();
    return;
  }

  // Prepare environment variables
  const env = {
    ...process.env,
    PORT: SERVER_PORT,
    IP: SERVER_IP,
    NODE_ENV: app.isPackaged ? 'production' : 'development'
  };

  // Add server node_modules to NODE_PATH if packaged
  if (app.isPackaged) {
    const serverNodeModules = path.join(basePath, 'server/node_modules');
    env.NODE_PATH = serverNodeModules;
  }

  serverProcess = spawn('node', [serverPath], { env });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server stdout: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error(`Server stderr: ${error}`);
    // Write to log file in production
    if (app.isPackaged) {
      const logPath = path.join(basePath, 'server-error.log');
      fs.writeFileSync(logPath, error, { flag: 'a' });
    }
  });

  serverProcess.on('error', (err) => {
    console.error('Server process error:', err);
    dialog.showErrorBox('Server Error', `Failed to start server: ${err.message}`);
    app.quit();
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    if (code !== 0) {
      dialog.showErrorBox('Server Error', `Server process exited with code ${code}`);
      app.quit();
    }
  });

  return SERVER_URL;
}

async function startClient() {
  const CLIENT_PORT = isDev ? 5173 : 3000;
  const CLIENT_URL = `http://${CLIENT_IP}:${CLIENT_PORT}`;

  if (isDev) {
    console.log(`Starting Vite dev server at ${CLIENT_URL}`);
    viteProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(basePath, '../client'),
      env: { ...process.env },
      shell: true,
    });

    viteProcess.stdout.on('data', (data) => {
      console.log(`Vite stdout: ${data}`);
    });

    viteProcess.stderr.on('data', (data) => {
      console.error(`Vite stderr: ${data}`);
    });

    viteProcess.on('error', (err) => {
      console.error('Vite process error:', err);
      dialog.showErrorBox('Vite Error', `Failed to start Vite dev server: ${err.message}`);
      app.quit();
    });

    viteProcess.on('close', (code) => {
      console.log(`Vite process exited with code ${code}`);
      if (code !== 0) {
        dialog.showErrorBox('Vite Error', `Vite dev server exited with code ${code}`);
        app.quit();
      }
    });

    try {
      await waitOn({ resources: [CLIENT_URL], timeout: 60000 });
      console.log('Vite dev server is running');
    } catch (err) {
      console.error('Failed to wait for Vite server:', err);
      dialog.showErrorBox('Vite Error', `Failed to connect to Vite dev server: ${err.message}`);
      app.quit();
      return;
    }

    return CLIENT_URL;
  }

  // Production client serving
  const clientDistPath = path.join(basePath, 'client/dist');
  
  // Verify client files exist
  if (!fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    const error = `Client files not found in: ${clientDistPath}`;
    console.error(error);
    dialog.showErrorBox('Client Error', error);
    app.quit();
    return;
  }

  const clientApp = express();
  clientApp.use(express.static(clientDistPath));
  clientApp.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  
  const server = clientApp.listen(CLIENT_PORT, () => {
    console.log(`Production client running on port ${CLIENT_PORT}`);
  });

  server.on('error', (err) => {
    console.error('Client server error:', err);
    dialog.showErrorBox('Client Error', `Failed to start client server: ${err.message}`);
    app.quit();
  });

  return CLIENT_URL;
}

app.on('ready', async () => {
  try {
    console.log('Starting application...');
    console.log('Base path:', basePath);
    console.log('Server Env:', serverEnv);
    console.log('Client Env:', clientEnv);
    
    console.log('Starting server...');
    const SERVER_URL = await startServer();
    
    console.log('Waiting for server...');
    await waitOn({ 
      resources: [SERVER_URL], 
      timeout: 120000,
      validateStatus: (status) => status < 400 || status === 501 
    });
    
    console.log('Starting client...');
    const clientUrl = await startClient();
    
    console.log('Creating window...');
    await createWindow(clientUrl);
    
    console.log('Electron app is ready');
  } catch (err) {
    console.error('Error starting app:', err);
    dialog.showErrorBox('Startup Error', `Failed to start the app: ${err.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (viteProcess) {
      viteProcess.kill();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
    const clientUrl = `http://${CLIENT_IP}:${isDev ? 5173 : 3000}`;
    await createWindow(clientUrl);
    console.log('Electron app activated');
  }
});

app.on('quit', () => {
  if (viteProcess) {
    viteProcess.kill();
  }
  if (serverProcess) {
    serverProcess.kill();
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  dialog.showErrorBox('Unexpected Error', `Unhandled promise rejection: ${reason}`);
  app.quit();
});