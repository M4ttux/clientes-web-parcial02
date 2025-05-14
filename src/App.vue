<script>

import Home from './pages/Home.vue';
import { logout, subscribeToAuth } from './services/auth';
import MainNav from './components/MainNav.vue';
import { useRoute } from 'vue-router';
import MainFooter from './components/MainFooter.vue';

export default {
  name: 'App',
  components: { Home, MainNav, MainFooter },
  setup() {
    const route = useRoute()

    // Rutas que queremos centrar (por nombre de la ruta)
    const fullScreenRoutes = ['ingresar', 'registro']

    const isCentered = () => fullScreenRoutes.includes(route.name)

    return { isCentered }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-900 text-white">
    <MainNav />

    <!-- CONTENIDO PRINCIPAL -->
      <main
    :class="[
      'flex-grow px-4 py-6',
      isCentered() ? 'flex items-center justify-center' : 'container mx-auto'
    ]"
  >
    <router-view />
  </main>


    <!-- FOOTER -->
    <MainFooter />
  </div>
</template>