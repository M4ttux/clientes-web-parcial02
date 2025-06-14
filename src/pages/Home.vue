<script>
// Importaciones de Vue y componentes
import { onMounted, ref } from 'vue'
import MainH1 from '../components/MainH1.vue'
import PostCard from '../components/PostCard.vue'
import MainLoader from '../components/MainLoader.vue'

// Supabase y servicios relacionados a publicaciones
import supabase from '../services/supabase'
import {
  getAllPosts,
  createPost,
  subscribeToNewComments,
  subscribeToNewPosts
} from '../services/posts'

export default {
  components: {
    MainH1,
    PostCard,
    MainLoader
  },

  setup() {
    // Variables reactivas
    const posts = ref([]) // Lista de publicaciones
    const loading = ref(true) // Estado de carga
    const newPost = ref('') // Contenido del nuevo post
    const user = ref(null) // Usuario autenticado
    const posting = ref(false) // Estado de publicación

    /**
     * Trae las publicaciones desde Supabase.
     */
    const fetchPosts = async () => {
      try {
        posts.value = await getAllPosts()
      } catch (err) {
        console.error('Error al cargar publicaciones:', err)
      }
    }

    /**
     * Crea una nueva publicación y la agrega a la lista.
     */
    const handleCreatePost = async () => {
      if (!newPost.value.trim()) return
      posting.value = true

      // Trae el usuario autenticado
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()

      try {
        const post = await createPost(newPost.value, currentUser.id)
        posts.value.unshift(post) // Insertamos arriba del feed
        newPost.value = ''
      } catch (err) {
        console.error('Error al crear publicación:', err)
      }

      posting.value = false
    }

    /**
     * Lógica que se ejecuta al montar el componente.
     * Incluye: obtener usuario, publicaciones y suscribirse a eventos en tiempo real.
     */
    onMounted(async () => {
      // Usuario autenticado
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()
      user.value = currentUser

      // Cargar publicaciones iniciales
      await fetchPosts()
      loading.value = false

      /**
       * Suscribirse a nuevos comentarios en tiempo real.
       * Si ya existe el comentario (por un insert duplicado), no se agrega.
       */
      subscribeToNewComments(async ({ new: newComment }) => {
        const post = posts.value.find(p => p.id === newComment.post_id)
        if (post) {
          const alreadyExists = post.comments?.some(c => c.id === newComment.id)
          if (alreadyExists) return

          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, display_name')
            .eq('id', newComment.user_profile_id)
            .single()

          if (!post.comments) post.comments = []

          post.comments.push({
            ...newComment,
            user_profiles: profile || { display_name: 'Usuario' }
          })
        }
      })

      /**
       * Suscribirse a nuevos posts en tiempo real.
       * Evita duplicados si ya están en el feed.
       */
      subscribeToNewPosts(async ({ new: newPostData }) => {
        if (posts.value.some(p => p.id === newPostData.id)) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .eq('id', newPostData.user_profile_id)
          .single()

        posts.value.unshift({
          ...newPostData,
          user_profiles: profile || { display_name: 'Usuario' },
          comments: []
        })
      })
    })

    // Retornamos las variables y funciones al template
    return {
      posts,
      loading,
      newPost,
      user,
      posting,
      handleCreatePost
    }
  }
}
</script>


<template>
  <div class="flex justify-center">
    <div class="w-full max-w-4xl p-4">
      <MainH1 class="mb-4 text-white text-center">Publicaciones</MainH1>


      <div v-if="user" class="mb-6">
        <textarea v-model="newPost" rows="3"
          class="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 resize-none mb-2"
          placeholder="¿Qué estás pensando?"></textarea>
        <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded" :disabled="posting"
          @click="handleCreatePost">
          {{ posting ? 'Publicando...' : 'Publicar' }}
        </button>
      </div>
      <h2 class="mb-4 text-white text-center text-2xl">Últimas Publicaciones</h2>
      <MainLoader v-if="loading" class="mx-auto" />


      <ol v-else class="space-y-4">
        <li v-for="post in posts" :key="post.id">
          <PostCard :post="post" />
        </li>
      </ol>
    </div>
  </div>
</template>
