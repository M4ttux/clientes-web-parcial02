<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { cambiarPassword } from '../services/auth'

const nuevaPassword = ref('')
const repetirPassword = ref('')
const error = ref('')
const exito = ref(false)


const router = useRouter()

/**
 * Función que valida e intenta cambiar la contraseña.
 */
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
      router.push({ name: 'MyProfileEdit' })
    }, 2000)
  } catch (err) {
    error.value = 'Error al actualizar la contraseña.'
    console.error(err)
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto mt-10 bg-gray-800 text-white p-6 rounded-lg shadow-lg">
    <!-- Título -->
    <h2 class="text-xl font-semibold mb-4 text-center">Cambiar Contraseña</h2>

    <!-- Campo: Nueva contraseña -->
    <div class="mb-4">
      <label class="block mb-1">Nueva contraseña</label>
      <input type="password" v-model="nuevaPassword" class="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" />
    </div>

    <!-- Campo: Repetir contraseña -->
    <div class="mb-4">
      <label class="block mb-1">Repetir nueva contraseña</label>
      <input type="password" v-model="repetirPassword"
        class="w-full p-2 rounded-lg bg-gray-700 border border-gray-600" />
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="text-red-400 text-sm mb-2">{{ error }}</p>

    <!-- Mensaje de éxito -->
    <p v-if="exito" class="text-green-400 text-sm mb-2">
      ✔ Contraseña actualizada correctamente.
    </p>

    <div class="flex gap-4 mt-4">
      <!-- Botón para volver -->
      <button @click="router.push('/mi-perfil/editar')"
        class="w-1/2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
        ← Volver a editar perfil
      </button>

      <!-- Botón para confirmar -->
      <button @click="cambiar" class="w-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        Confirmar cambio
      </button>
    </div>
  </div>
</template>
