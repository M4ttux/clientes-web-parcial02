<script>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// Componentes reutilizables
import MainH1 from '../components/MainH1.vue'
import PostCard from '../components/PostCard.vue'
import MainLoader from '../components/MainLoader.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

// Servicios
import {
  getUserProfileByPK,
  getPostsByUser,
  getCommentsByUser,
  deletePostById,
  deleteCommentById,
  subscribeToUserComments
} from '../services/user-profile'
import { getCurrentUser, getCurrentSession } from '../services/auth'

export default {
  components: {
    MainH1,
    PostCard,
    MainLoader,
    ConfirmModal
  },

  setup() {
    const router = useRouter()
    const perfil = ref(null)
    const publicaciones = ref([])
    const comentarios = ref([])
    const cargando = ref(true)

    const mostrarModal = ref(false)
    const tituloModal = ref('')
    const mensajeModal = ref('')
    const accionConfirmada = ref(null)

    const abrirModal = (titulo, mensaje, accion) => {
      tituloModal.value = titulo
      mensajeModal.value = mensaje
      accionConfirmada.value = accion
      mostrarModal.value = true
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      accionConfirmada.value = null
    }

    const confirmarModal = async () => {
      if (accionConfirmada.value) await accionConfirmada.value()
      cerrarModal()
    }

    const eliminarPublicacion = (id) => {
      abrirModal(
        'Eliminar publicación',
        '¿Seguro que querés eliminar esta publicación?',
        async () => {
          try {
            await deletePostById(id)
            publicaciones.value = publicaciones.value.filter(p => p.id !== id)
          } catch (e) {
            console.error('Error al eliminar publicación:', e)
          }
        }
      )
    }

    const eliminarComentario = (id) => {
      abrirModal(
        'Eliminar comentario',
        '¿Seguro que querés eliminar este comentario?',
        async () => {
          try {
            await deleteCommentById(id)
            comentarios.value = comentarios.value.filter(c => c.id !== id)
          } catch (e) {
            console.error('Error al eliminar comentario:', e)
          }
        }
      )
    }

    const irAEditarPerfil = () => {
      router.push({ name: 'MyProfileEdit' })
    }

    let canalComentarios = null

    onMounted(async () => {
      try {
        const session = await getCurrentSession()
        const usuario = getCurrentUser()

        if (!usuario?.id || !session) {
          console.warn('No hay usuario autenticado')
          cargando.value = false
          return
        }

        const datosPerfil = await getUserProfileByPK(usuario.id)
        perfil.value = datosPerfil

        publicaciones.value = await getPostsByUser(datosPerfil.id)
        comentarios.value = await getCommentsByUser(datosPerfil.id)

        canalComentarios = subscribeToUserComments(usuario.id, async () => {
          comentarios.value = await getCommentsByUser(datosPerfil.id)
        })
      } catch (error) {
        console.error('Error al cargar el perfil:', error)
      } finally {
        cargando.value = false
      }
    })

    onUnmounted(() => {
      if (canalComentarios) {
        canalComentarios.unsubscribe()
      }
    })

    return {
      perfil,
      publicaciones,
      comentarios,
      cargando,
      irAEditarPerfil,
      eliminarPublicacion,
      eliminarComentario,
      mostrarModal,
      tituloModal,
      mensajeModal,
      confirmarModal,
      cerrarModal
    }
  }
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <MainH1 class="text-white">Mi Perfil</MainH1>
      <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded" @click="irAEditarPerfil">
        Editar perfil
      </button>
    </div>

    <MainLoader v-if="cargando" class="mx-auto" />

    <div v-else>
      <div v-if="perfil">
        <!-- Datos del perfil -->
        <div class="bg-gray-800 text-white rounded-xl p-4 shadow mb-6 text-center">
          <div class="flex justify-center mb-4">
            <img
              :src="perfil.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.display_name)}&background=4b5563&color=ffffff`"
              alt="Avatar" class="w-24 h-24 rounded-full border border-gray-600" />
          </div>
          <h2 class="text-2xl font-bold mb-1">{{ perfil.display_name }}</h2>
          <p class="text-sm text-gray-400 mb-2">
            Te uniste el {{ new Date(perfil.created_at).toLocaleDateString('es-AR') }}
          </p>
          <p class="mb-2"><strong>Biografía:</strong> {{ perfil.bio || 'Sin biografía' }}</p>
          <p><strong>Carrera:</strong> {{ perfil.career || 'No especificada' }}</p>
        </div>

        <!-- Publicaciones -->
        <div>
          <h3 class="text-xl text-white font-semibold mb-3">Mis Publicaciones</h3>
          <PostCard
            v-for="post in publicaciones"
            :key="post.id"
            :post="post"
            :showDelete="true"
            :onDelete="eliminarPublicacion"
          />
          <p v-if="publicaciones.length === 0" class="text-gray-400">Todavía no publicaste nada.</p>
        </div>

        <!-- Comentarios -->
        <div class="mt-8">
          <h3 class="text-xl text-white font-semibold mb-3">Mis Comentarios</h3>
          <div
            v-for="comment in comentarios"
            :key="comment.id"
            class="bg-gray-700 text-white p-3 rounded-lg mb-3"
          >
            <div class="flex items-center gap-3 mb-1">
              <img
                :src="comment.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_profiles?.display_name || '')}&background=4b5563&color=ffffff`"
                alt="avatar"
                class="w-8 h-8 rounded-full border border-gray-500"
              />
              <span class="font-semibold text-blue-300 text-sm">
                {{ comment.user_profiles?.display_name || 'Anónimo' }}
              </span>
              <span class="ml-auto text-xs text-gray-400">
                {{ new Date(comment.created_at).toLocaleString('es-AR') }}
              </span>
            </div>
            <p class="text-gray-200">{{ comment.content }}</p>
            <div class="text-right mt-1">
              <button @click="eliminarComentario(comment.id)" class="text-sm text-red-400 hover:text-red-600 cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
          <p v-if="comentarios.length === 0" class="text-gray-400">Todavía no comentaste ninguna publicación.</p>
        </div>
      </div>

      <div v-else class="text-gray-400 italic">
        No se pudo cargar tu perfil.
      </div>
    </div>

    <!-- Modal de confirmación -->
    <ConfirmModal
      :visible="mostrarModal"
      :title="tituloModal"
      :message="mensajeModal"
      @confirm="confirmarModal"
      @cancel="cerrarModal"
    />
  </div>
</template>
