import { defineConfig } from 'vite';
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                home: resolve(__dirname, './src/pages/home/home.html'),
                login: resolve(__dirname, './src/pages/login/login.html'),
                register: resolve(__dirname, './src/pages/register/register.html'),
                calendar: resolve(__dirname, './src/pages/calendar/calendar.html'),
                notes: resolve(__dirname, './src/pages/notes/notes.html'),
                todo: resolve(__dirname, './src/pages/todo/todo.html'),
                finance: resolve(__dirname, './src/pages/finance/finance.html')
            }
        },
    },
});
