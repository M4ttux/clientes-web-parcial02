<script>
// Importa las funciones para suscribirse al auth y cerrar sesión
import { subscribeToAuth, logout } from '../services/auth';
// Importa el cliente de Supabase para consultas
import supabase from '../services/supabase';

export default {
  name: 'MainNav',

  data() {
    return {
      // Estado del usuario autenticado
      user: {
        id: null,
        email: null,
      },
      // Perfil extendido (como display_name)
      userProfile: null,
      // Estado del menú hamburguesa (abierto/cerrado)
      menuOpen: false
    };
  },

  methods: {
    /**
     * Cierra la sesión y redirige al login.
     */
    handleLogout() {
      logout();
      this.$router.push('/ingresar');
    },

    /**
     * Alterna la visibilidad del menú hamburguesa en móviles.
     */
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },

    /**
     * Carga el perfil extendido del usuario autenticado desde Supabase.
     */
    async loadUserProfile() {
      if (!this.user.id) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', this.user.id)
        .single();

      if (!error) {
        this.userProfile = data;
      } else {
        console.error('[MainNav.vue] No se pudo cargar el perfil:', error);
      }
    }
  },

  /**
   * Cuando el componente se monta, se suscribe a cambios de auth y carga el perfil si hay usuario.
   */
  mounted() {
    subscribeToAuth(async (newUserData) => {
      this.user = newUserData;
      if (this.user?.id) {
        await this.loadUserProfile();
      }
    });
  }
}
</script>

<template>
  <nav class="bg-gray-900 border-gray-200">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      
      <!-- Logo / Marca -->
      <router-link to="/" class="flex items-center space-x-3">
        <span class="self-center text-2xl font-semibold whitespace-nowrap text-white">Social Media</span>
      </router-link>

      <!-- Botón hamburguesa visible solo en móvil -->
      <button
        @click="toggleMenu"
        type="button"
        class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
        aria-controls="navbar-default"
        aria-expanded="false"
      >
        <span class="sr-only">Abrir menú</span>
        <svg class="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 17 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M1 1h15M1 7h15M1 13h15" />
        </svg>
      </button>

      <!-- Enlaces de navegación -->
      <div :class="['w-full md:block md:w-auto', menuOpen ? 'block' : 'hidden']" id="navbar-default">
        <ul
          class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-700 rounded-lg bg-gray-800 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-gray-900 text-white"
        >
          <!-- Link a Home -->
          <li>
            <router-link
              to="/"
              class="block py-2 px-3 rounded-lg hover:text-blue-400 md:p-0"
              exact-active-class="text-blue-500"
            >
              Home
            </router-link>
          </li>

          <!-- Si el usuario NO está logueado -->
          <template v-if="!user.id">
            <li>
              <router-link to="/ingresar" class="block py-2 px-3 hover:text-blue-400 md:p-0">Iniciar Sesión</router-link>
            </li>
            <li>
              <router-link to="/registro" class="block py-2 px-3 hover:text-blue-400 md:p-0">Registrarse</router-link>
            </li>
          </template>

          <!-- Si el usuario está logueado -->
          <template v-else>
            <li>
              <router-link to="/chat-global" class="block py-2 px-3 hover:text-blue-400 md:p-0">Chat Global</router-link>
            </li>
            <li>
              <router-link to="/mi-perfil" class="block py-2 px-3 hover:text-blue-400 md:p-0">Mi Perfil</router-link>
            </li>
            <li>
              <!-- Cierre de sesión con nombre o email -->
              <button @click="handleLogout" class="block py-2 px-3 hover:text-red-400 md:p-0">
                {{ userProfile?.display_name || user.email }} (Cerrar sesión)
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
