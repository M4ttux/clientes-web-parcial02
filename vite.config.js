// Importamos el plugin de Vue para Vite.
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default {
    // Agregamos el plugin de Vue.
    plugins: [vue(), tailwindcss()],
}