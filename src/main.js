import './style.css';
import { createApp } from 'vue'; // Importamos la función para crear la aplicación de Vue.
import router from './router/router.js'; // Importamos el router.
import App from './App.vue'; // Importamos el componente de [App.vue].
// import App from 'App.vue'; // <-- No funciona, le falta el "./".

// Creamos la aplicación con la función createApp, que recibe como argumento el componente raíz.
// Nos retorna el objeto de la aplicación.
const app = createApp(App);

// Asociamos nuestro router a nuestra aplicación.
app.use(router);

// Montamos la aplicación en el elemento con el id app.
app.mount('#app');