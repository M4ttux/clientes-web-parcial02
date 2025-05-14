<script>
  // Importamos el componente de título principal y la función de login
  import MainH1 from "../components/MainH1.vue";
  import { login } from "../services/auth";

  export default {
    name: "Login",
    components: { MainH1 },

    data() {
      return {
        // Datos del formulario de inicio de sesión
        user: {
          email: "",
          password: "",
        }
      }
    },

    methods: {
      /**
       * Maneja el envío del formulario de login.
       * Llama a la función de login del servicio de autenticación y redirige a Home si tiene éxito.
       */
      async handleSubmit() {
        try {
          const user = await login(this.user.email, this.user.password);
          // Si el login es exitoso, redirige al home
          this.$router.push({ name: "home" });
        } catch (error) {
          // Si ocurre un error, lo mostramos en consola
          console.error("[Login.vue handleSubmit] Error al loguear el usuario: ", error);
        }
      }
    }
  };
</script>


<template>
  <div class="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
    <MainH1>Ingresar a Mi Cuenta</MainH1>

    <form action="#" @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="email" class="block mb-2 text-gray-300">Email</label>
        <input v-model="user.email" type="email" id="email"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div class="mb-6">
        <label for="password" class="block mb-2 text-gray-300">Contraseña</label>
        <input v-model="user.password" type="password" id="password"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition duration-200">
        Ingresar
      </button>
    </form>
    <div class="mt-4 text-center text-gray-300">
      <span>No tienes cuenta? </span>
      <router-link to="/registro" class="text-blue-500 hover:text-blue-400">Crear una cuenta</router-link>
    </div>
  </div>
</template>
