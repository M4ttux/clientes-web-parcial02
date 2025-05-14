<script>
import { onMounted, ref } from 'vue'
import MainH1 from '../components/MainH1.vue'
import PostCard from '../components/PostCard.vue'
import MainLoader from '../components/MainLoader.vue'
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
    const posts = ref([])
    const loading = ref(true)
    const newPost = ref('')
    const user = ref(null)
    const posting = ref(false)

    const fetchPosts = async () => {
      try {
        posts.value = await getAllPosts()
      } catch (err) {
        console.error('Error al cargar publicaciones:', err)
      }
    }

    const handleCreatePost = async () => {
      if (!newPost.value.trim()) return
      posting.value = true

      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()

      try {
        const post = await createPost(newPost.value, currentUser.id)
        posts.value.unshift(post)
        newPost.value = ''
      } catch (err) {
        console.error('Error al crear publicación:', err)
      }

      posting.value = false
    }

    onMounted(async () => {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser()
      user.value = currentUser

      await fetchPosts()
      loading.value = false

      // Comentarios en tiempo real
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


      // Nuevos posts en tiempo real
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
      <MainH1 class="mb-4 text-white text-center">Últimas Publicaciones</MainH1>

      <div v-if="user" class="mb-6">
        <textarea v-model="newPost" rows="3"
          class="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 resize-none mb-2"
          placeholder="¿Qué estás pensando?"></textarea>
        <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded" :disabled="posting"
          @click="handleCreatePost">
          {{ posting ? 'Publicando...' : 'Publicar' }}
        </button>
      </div>

      <MainLoader v-if="loading" class="mx-auto" />

      <div v-else>
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>
