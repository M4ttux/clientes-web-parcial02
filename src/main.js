/*
# Breve nota sobre las rutas en los *imports* con Vite (y npm)
Como estamos usando Vite y npm para procesar nuestro proyecto, la forma en las rutas trabajan es un poco diferente a lo
"normal".
Hay 3 posibilidades que podemos poner como ruta.
1. Ruta absoluta: Las rutas absolutas son cuando la URL incluye la ruta completa (incluyendo todo, como el protocolo y el
  dominio). Ej: "https://sara.za/saraza.jpg".
2. Ruta relativa: Las rutas relativas son cuando la URL se basa en la ubicación actual. Es decir, en "relación" a donde
  estamos parados. 
  Es MUY importante recordar que en Vite y npm las URLs relativas REQUIEREN empezar con "../" o "./".
  O sea, nos podemos omitir el "./" como estamos acostumbrados a hacer.
  ¿Por qué no? Por el siguiente caso:
3. Nombre de paquetes: Si la ruta no empieza con "./" o "../", npm asume que es un paquete de npm. Es decir, que es un
  paquete que corresponde a alguna carpeta que existe en [node_modules].
  Por ejemplo, cuando escribimos "vue", hace referencia al paquete de "vue" que agregamos.
  Si tratamos de poner una URL relativa sin el "./", Vite y npm van a suponer que se trata de un paquete.
  Por ejemplo, si ponemos "App.vue", no va a buscar el archivo "App.vue" en la carpeta donde estamos, sino que va a 
  buscar un paquete de npm llamado "App.vue".
*/
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