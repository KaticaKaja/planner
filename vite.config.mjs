import { defineConfig } from 'vite';
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                home: resolve(__dirname, './src/components/home/home.html'),
                login: resolve(__dirname, './src/components/login/login.html'),
                register: resolve(__dirname, './src/components/register/register.html'),
                calendar: resolve(__dirname, './src/components/calendar/calendar.html'),
                notes: resolve(__dirname, './src/components/notes/notes.html'),
                todo: resolve(__dirname, './src/components/todo/todo.html'),
                finance: resolve(__dirname, './src/components/finance/finance.html')
            }
        },
    },
});
