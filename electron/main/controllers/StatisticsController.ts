import { ipcMain } from 'electron';
import Store from 'electron-store';
const store = new Store({
    name: 'statistics',
});