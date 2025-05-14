<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { cambiarPassword } from '../services/auth'

const nuevaPassword = ref('')
const repetirPassword = ref('')
const error = ref('')
const exito = ref(false)
const router = useRouter()

const cambiar = async () => {
  error.value = ''
  exito.value = false

  if (nuevaPassword.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (nuevaPassword.value !== repetirPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    await cambiarPassword(nuevaPassword.value)
    exito.value = true
    setTimeout(() => {
      router.push({ name: 'MyProfileEdit' }) // o usa path: '/editar-perfil' si no tenés alias de nombre
    }, 2000)
  } catch (err) {
    error.value = 'Error al actualizar la contraseña.'
    console.error(err)
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto mt-10 bg-gray-800 text-white p-6 rounded-xl shadow-lg">
    <h2 class="text-xl font-semibold mb-4 text-center">Cambiar Contraseña</h2>

    <div class="mb-4">
      <label class="block mb-1">Nueva contraseña</label>
      <input
        type="password"
        v-model="nuevaPassword"
        class="w-full p-2 rounded bg-gray-700 border border-gray-600"
      />
    </div>

    <div class="mb-4">
      <label class="block mb-1">Repetir nueva contraseña</label>
      <input
        type="password"
        v-model="repetirPassword"
        class="w-full p-2 rounded bg-gray-700 border border-gray-600"
      />
    </div>

    <p v-if="error" class="text-red-400 text-sm mb-2">{{ error }}</p>
    <p v-if="exito" class="text-green-400 text-sm mb-2">✔ Contraseña actualizada correctamente.</p>

    <button
      @click="cambiar"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      Confirmar cambio
    </button>
  </div>
</template>
