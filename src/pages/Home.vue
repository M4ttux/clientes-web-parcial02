<script>
import { onMounted, ref } from 'vue'
import { getAllPosts, createPost } from '../services/posts'
import { getCurrentUser } from '../services/auth'
import PostCard from '../components/PostCard.vue'
import MainH1 from '../components/MainH1.vue'
import MainLoader from '../components/MainLoader.vue'

export default {
  components: {
    PostCard,
    MainH1,
    MainLoader
  },

  setup() {
    const posts = ref([])
    const newPost = ref('')
    const loading = ref(true)
    const posting = ref(false)
    const user = getCurrentUser()

    const fetchPosts = async () => {
      loading.value = true
      try {
        posts.value = await getAllPosts()
      } catch (err) {
        console.error('Error al obtener posts:', err)
      }
      loading.value = false
    }

    const handleCreatePost = async () => {
      if (!newPost.value.trim()) return

      const user = getCurrentUser()
      if (!user?.id) {
        alert('Debes estar logueado para publicar.')
        return
      }

      posting.value = true
      try {
        const post = await createPost(newPost.value, user.id)
        posts.value.unshift(post)
        newPost.value = ''
      } catch (err) {
        console.error('Error al crear el post:', err)
      }
      posting.value = false
    }

    onMounted(fetchPosts)

    return {
      posts,
      newPost,
      loading,
      posting,
      handleCreatePost,
      user
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
