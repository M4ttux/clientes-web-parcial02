<script>
export default {
  name: 'MainFooter'
}
</script>

<template>
  <footer class="bg-gray-800 text-gray-300 py-6 mt-10">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Nombre del proyecto -->
      <div class="text-center md:text-left text-sm">
        © {{ new Date().getFullYear() }} Social Media. Todos los derechos reservados.
      </div>

      <!-- Enlaces -->
      <ul class="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
        <li><router-link to="/" class="hover:text-blue-400 transition">Inicio</router-link></li>
        <li><router-link to="/chat-global" class="hover:text-blue-400 transition">Chat Global</router-link></li>
        <li><router-link to="/mi-perfil" class="hover:text-blue-400 transition">Mi Perfil</router-link></li>
      </ul>
    </div>
  </footer>
</template>