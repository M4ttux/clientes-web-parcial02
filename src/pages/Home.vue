<script>
import { onMounted, ref } from 'vue'
import { getAllPosts, createPost, uploadPostImage } from '../services/posts'
import { subscribeToAuth } from '../services/auth'
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
    const user = ref(null)
    const imagen = ref(null)
    const imagenError = ref("")
    const imagenPreview = ref(null)

    // Escuchar cambios en auth
    onMounted(async () => {
      subscribeToAuth((u) => {
        user.value = u?.id ? u : null
      })

      await fetchPosts()
    })

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

      if (!user.value?.id) {
        alert('Debes estar logueado para publicar.')
        return
      }

      posting.value = true
      try {
        let imageUrl = null
        if (imagen.value) {
          imageUrl = await uploadPostImage(imagen.value)
        }

        const post = await createPost(newPost.value, imageUrl)
        posts.value.unshift(post)
        newPost.value = ''
        imagen.value = null
      } catch (err) {
        console.error('Error al crear el post:', err)
      }
      posting.value = false
    }

    const maxSizeKB = 300

    const handleFileChange = (e) => {
      const archivo = e.target.files[0]
      imagenError.value = ""
      imagenPreview.value = null

      if (!archivo) return

      if (archivo.size > maxSizeKB * 1024) {
        imagenError.value = `La imagen no debe superar los ${maxSizeKB} KB.`
        e.target.value = ''
        return
      }

      imagen.value = archivo
      imagenPreview.value = URL.createObjectURL(archivo)
    }

    const eliminarImagen = () => {
      imagen.value = null
      imagenPreview.value = null
      imagenError.value = ''

      // Resetear el input manualmente para que permita volver a elegir el mismo archivo
      const inputFile = document.getElementById('imagen')
      if (inputFile) inputFile.value = ''
    }

    return {
      posts,
      newPost,
      imagen,
      imagenError,
      imagenPreview,
      loading,
      posting,
      handleCreatePost,
      handleFileChange,
      eliminarImagen,
      user
    }
  }
}
</script>



<template>
  <div class="flex justify-center">
    <div class="w-full max-w-4xl p-4">
      <MainH1 class="mb-4 text-white text-center">Publicaciones</MainH1>


      <div v-if="user" class="mb-6 p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-lg space-y-4">
        <div>
          <label for="newPost" class="block text-sm text-gray-300 mb-2">Crear una nueva publicación</label>
          <textarea v-model="newPost" rows="3"
            class="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 resize-none"
            placeholder="¿Qué estás pensando?" id="newPost">
          </textarea>
        </div>
        <div class="flex flex-col md:flex-row md:items-end gap-4">
          <!-- Selector de imagen + error + preview -->
          <div class="flex-1">
            <label class="block text-sm text-gray-300 mb-2">Imagen (opcional)</label>

            <!-- Botón personalizado -->
            <label for="imagen"
              class="inline-block cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition border border-gray-500">
              Seleccionar Imagen
            </label>

            <!-- Input oculto -->
            <input id="imagen" type="file" accept="image/*" @change="handleFileChange" class="hidden" />

            <!-- Error -->
            <p v-if="imagenError" class="text-red-400 text-xs mt-2">{{ imagenError }}</p>

            <!-- Vista previa -->
            <div v-if="imagenPreview" class="mt-3 flex items-center gap-4">
              <img :src="imagenPreview" alt="Vista previa"
                class="rounded-lg max-w-[100px] border border-gray-600 shadow-lg" />
              <button @click="eliminarImagen" type="button" class="text-red-400 hover:text-red-300 text-sm underline">
                Quitar imagen
              </button>
            </div>
          </div>


          <!-- Botón -->
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-lg transition"
            :disabled="posting" @click="handleCreatePost">
            {{ posting ? 'Publicando...' : 'Publicar' }}
          </button>
        </div>
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
