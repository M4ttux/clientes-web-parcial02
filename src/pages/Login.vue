<script>
import MainH1 from '../components/MainH1.vue'
import { login } from '../services/auth'

export default {
  name: 'IniciarSesion',
  components: { MainH1 },

  data() {
    return {
      credenciales: {
        email: '',
        password: ''
      },
      mensajeError: ''
    }
  },

  methods: {
    async handleSubmit() {
      this.mensajeError = ''
      try {
        await login(this.credenciales.email, this.credenciales.password)
        this.$router.push({ name: 'home' })
      } catch (error) {
        console.error('[Login.vue] Error de login:', error)
        this.mensajeError = 'Email o contraseña incorrectos.'
      }
    }
  }
}
</script>


<template>
  <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
    <MainH1>Iniciar sesión</MainH1>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label for="email" class="block mb-1 text-sm text-gray-300">Correo electrónico</label>
        <input v-model="credenciales.email" type="email" id="email"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label for="password" class="block mb-1 text-sm text-gray-300">Contraseña</label>
        <input v-model="credenciales.password" type="password" id="password"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <p v-if="mensajeError" class="text-red-400 text-sm text-center">{{ mensajeError }}</p>

      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-200">
        Ingresar
      </button>
    </form>

    <div class="mt-4 text-center text-gray-300">
      <span>¿No tenés cuenta? </span>
      <router-link to="/registro" class="text-blue-400 hover:underline">Crear una cuenta</router-link>
    </div>
  </div>
</template>
