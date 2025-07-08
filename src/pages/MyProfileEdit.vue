<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainH1 from '../components/MainH1.vue'
import MainLoader from '../components/MainLoader.vue'
import {
  getUserProfileByPK,
  updateUserProfile,
  uploadUserAvatar
} from '../services/user-profile'

import {
  cambiarPassword,
  getCurrentUser,
  getCurrentSession
} from '../services/auth'

export default {
  components: {
    MainH1,
    MainLoader
  },

  setup() {
    const router = useRouter()

    const perfil = ref(null)
    const cargando = ref(true)
    const guardando = ref(false)
    const mensajeError = ref('')
    const nuevaPassword = ref('')
    const display_name = ref('')
    const bio = ref('')
    const carrera = ref('')

    onMounted(async () => {
      const session = await getCurrentSession()
      const usuario = getCurrentUser()

      if (!session || !usuario?.id) {
        router.push({ name: 'Login' })
        return
      }

      try {
        const datosPerfil = await getUserProfileByPK(usuario.id)
        perfil.value = datosPerfil
        display_name.value = datosPerfil.display_name || ''
        bio.value = datosPerfil.bio || ''
        carrera.value = datosPerfil.career || ''
      } catch (err) {
        console.error('Error al cargar perfil:', err)
        mensajeError.value = 'No se pudo cargar el perfil.'
      }

      cargando.value = false
    })

    const guardarCambios = async () => {
      mensajeError.value = ''

      if (!display_name.value.trim()) {
        mensajeError.value = 'El nombre es obligatorio.'
        return
      }

      guardando.value = true

      try {
        await updateUserProfile(perfil.value.id, {
          display_name: display_name.value,
          bio: bio.value,
          career: carrera.value
        })

        if (nuevaPassword.value.trim() !== '') {
          if (nuevaPassword.value.length < 6) {
            mensajeError.value = 'La contraseña debe tener al menos 6 caracteres.'
            guardando.value = false
            return
          }
          await cambiarPassword(nuevaPassword.value)
        }

        router.push({ name: 'MyProfile' })
      } catch (err) {
        console.error('Error al guardar cambios:', err)
        mensajeError.value = 'Hubo un error al guardar los cambios.'
      } finally {
        guardando.value = false
      }
    }

    const subirAvatar = async (e) => {
      const archivo = e.target.files[0]
      if (!archivo) return

      try {
        const publicUrl = await uploadUserAvatar(perfil.value.id, archivo)
        await updateUserProfile(perfil.value.id, { avatar_url: publicUrl })
        perfil.value.avatar_url = publicUrl
      } catch (err) {
        mensajeError.value = err.message || 'No se pudo subir el avatar.'
      }
    }

    return {
      display_name,
      bio,
      carrera,
      nuevaPassword,
      cargando,
      guardando,
      guardarCambios,
      mensajeError,
      subirAvatar,
      perfil
    }
  }
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <MainH1 class="text-white text-center mb-6">Editar Perfil</MainH1>

    <MainLoader v-if="cargando" class="mx-auto" />
    <div v-else class="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <form @submit.prevent="guardarCambios" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label for="nombre" class="block text-sm font-semibold mb-1">Nombre para mostrar *</label>
            <input id="nombre" type="text" v-model="display_name"
              class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required />
          </div>

          <div>
            <label for="carrera" class="block text-sm font-semibold mb-1">Intereses</label>
            <input id="carrera" type="text" v-model="carrera"
              class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label for="bio" class="block text-sm font-semibold mb-1">Biografía</label>
          <textarea id="bio" v-model="bio" rows="4"
            class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <div v-if="perfil?.avatar_url" class="flex justify-center">
          <img :src="perfil.avatar_url" alt="Avatar" class="w-28 h-28 rounded-full border-2 border-gray-700 mb-3" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Imagen de perfil</label>
          <input type="file" @change="subirAvatar"
            class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer" />
        </div>

        <div class="flex justify-center">
          <RouterLink to="/cambiar-password" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
            Cambiar contraseña
          </RouterLink>
        </div>

        <p v-if="mensajeError" class="text-red-400 text-sm text-center">{{ mensajeError }}</p>

        <div class="flex justify-between pt-4">
          <RouterLink to="/mi-perfil" class="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg">
            Volver
          </RouterLink>

          <button type="submit" :disabled="guardando"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50">
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

        <p class="text-sm text-gray-400 text-center mt-4">(*) Campo obligatorio</p>
      </form>
    </div>
  </div>
</template>
