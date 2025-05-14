<script>
import supabase from '../services/supabase'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainH1 from '../components/MainH1.vue'
import PostCard from '../components/PostCard.vue'
import MainLoader from '../components/MainLoader.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import {
  getUserProfileByPK,
  getPostsByUser,
  getCommentsByUser,
  deletePostById,
  deleteCommentById
} from '../services/user-profile'

export default {
  components: {
    MainH1,
    PostCard,
    MainLoader,
    ConfirmModal
  },
  setup() {
    const router = useRouter()
    const profile = ref(null)
    const posts = ref([])
    const comments = ref([])
    const loading = ref(true)

    const showModal = ref(false)
    const modalTitle = ref('')
    const modalMessage = ref('')
    const confirmAction = ref(null)

    const openModal = (title, message, action) => {
      modalTitle.value = title
      modalMessage.value = message
      confirmAction.value = action
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      confirmAction.value = null
    }

    const confirmModal = async () => {
      if (confirmAction.value) await confirmAction.value()
      closeModal()
    }

    const deletePost = (id) => {
      openModal(
        'Eliminar publicación',
        '¿Seguro que querés eliminar esta publicación?',
        async () => {
          try {
            await deletePostById(id)
            posts.value = posts.value.filter(post => post.id !== id)
          } catch (e) {
            console.error('Error al eliminar post:', e)
          }
        }
      )
    }

    const deleteComment = (id) => {
      openModal(
        'Eliminar comentario',
        '¿Seguro que querés eliminar este comentario?',
        async () => {
          try {
            await deleteCommentById(id)
            comments.value = comments.value.filter(comment => comment.id !== id)
          } catch (e) {
            console.error('Error al eliminar comentario:', e)
          }
        }
      )
    }

    const goToEdit = () => {
      router.push({ name: 'MyProfileEdit' })
    }

    let canalComentarios = null

    onMounted(async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()

        const user = session?.user

        if (!user || sessionError || !user.id) {
          console.warn('No hay usuario autenticado')
          loading.value = false
          return
        }

        const profileData = await getUserProfileByPK(user.id)
        profile.value = profileData

        const userProfileId = profileData.id
        posts.value = await getPostsByUser(userProfileId)
        comments.value = await getCommentsByUser(userProfileId)

        // ✅ SUSCRIPCIÓN A COMENTARIOS NUEVOS
        canalComentarios = supabase
          .channel('comentarios-usuario')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'comments',
              filter: `user_profile_id=eq.${user.id}`
            },
            async () => {
              comments.value = await getCommentsByUser(user.id)
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Error al cargar perfil, publicaciones o comentarios:', error)
      } finally {
        loading.value = false
      }
    })

    onUnmounted(() => {
      if (canalComentarios) {
        supabase.removeChannel(canalComentarios)
      }
    })

    return {
      profile,
      posts,
      comments,
      loading,
      goToEdit,
      deletePost,
      deleteComment,
      showModal,
      modalTitle,
      modalMessage,
      confirmModal,
      closeModal
    }
  }
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <MainH1 class="text-white">Mi Perfil</MainH1>
      <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded" @click="goToEdit">
        Editar perfil
      </button>
    </div>

    <MainLoader v-if="loading" class="mx-auto" />

    <div v-else>
      <div v-if="profile">
        <!-- Datos del perfil -->
        <div class="bg-gray-800 text-white rounded-xl p-4 shadow mb-6 text-center">
          <div v-if="profile.avatar_url" class="flex justify-center mb-4">
            <img
              :src="profile.avatar_url || 'https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=4b5563&color=ffffff'"
              alt="Avatar"
              class="w-24 h-24 rounded-full border border-gray-600"
            />
          </div>
          <h2 class="text-2xl font-bold mb-1">{{ profile.display_name }}</h2>
          <p class="text-sm text-gray-400 mb-2">
            Te uniste el {{ new Date(profile.created_at).toLocaleDateString('es-AR') }}
          </p>
          <p class="mb-2"><strong>Biografía:</strong> {{ profile.bio || 'Sin biografía' }}</p>
          <p><strong>Carrera:</strong> {{ profile.career || 'No especificada' }}</p>
        </div>

        <!-- Publicaciones -->
        <div>
          <h3 class="text-xl text-white font-semibold mb-3">Mis Publicaciones</h3>
          <PostCard v-for="post in posts" :key="post.id" :post="post" :showDelete="true" :onDelete="deletePost" />
          <p v-if="posts.length === 0" class="text-gray-400">Todavía no publicaste nada.</p>
        </div>

        <!-- Comentarios -->
        <div class="mt-8">
          <h3 class="text-xl text-white font-semibold mb-3">Mis Comentarios</h3>
          <div v-for="comment in comments" :key="comment.id" class="bg-gray-700 text-white p-3 rounded-lg mb-3">
            <div class="flex justify-between items-center mb-1">
              <p class="text-sm text-gray-400">
                Comentado el {{ new Date(comment.created_at).toLocaleString('es-AR') }}
              </p>
              <button @click="deleteComment(comment.id)" class="text-sm text-red-400 hover:text-red-600">
                Eliminar
              </button>
            </div>
            <p class="text-gray-200">{{ comment.content }}</p>
          </div>
          <p v-if="comments.length === 0" class="text-gray-400">Todavía no comentaste ninguna publicación.</p>
        </div>
      </div>

      <div v-else class="text-gray-400 italic">
        No se pudo cargar tu perfil.
      </div>
    </div>

    <!-- Modal de confirmación -->
    <ConfirmModal :visible="showModal" :title="modalTitle" :message="modalMessage" @confirm="confirmModal"
      @cancel="closeModal" />
  </div>
</template>
