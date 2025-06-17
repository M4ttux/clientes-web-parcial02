<script>
import { ref } from 'vue'
import EditPostModal from './EditPostModal.vue'
import PostComments from './PostComments.vue'

export default {
  components: {
    EditPostModal,
    PostComments
  },
  props: {
    post: Object,
    showDelete: Boolean,
    showEdit: Boolean,
    onDelete: Function,
    onEdit: Function
  },
  setup(props) {
    const showModal = ref(false)

    const handleEditSubmit = (data) => {
      props.onEdit?.(data.id, data.content, data.image, data.removeImage)
      showModal.value = false
    }

    return {
      showModal,
      handleEditSubmit
    }
  },
  computed: {
    formattedDate() {
      const date = new Date(this.post.created_at)
      return date.toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    }
  }
}
</script>

<template>
  <div class="bg-gray-800 text-white p-6 rounded-lg shadow-lg mb-6">
    <!-- Header: avatar + nombre + fecha -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex items-center gap-3">
        <img
          :src="post.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_profiles?.display_name)}&background=4b5563&color=ffffff`"
          alt="Avatar" class="w-10 h-10 rounded-full border border-gray-600" />
        <div>
          <router-link v-if="post.user_profiles?.id"
            :to="{ name: 'UserProfile', params: { id: post.user_profiles.id } }"
            class="text-blue-400 font-semibold hover:underline">
            {{ post.user_profiles?.display_name || 'Usuario desconocido' }}
          </router-link>
          <div class="text-xs text-gray-400">{{ formattedDate }}</div>
        </div>
      </div>
    </div>

    <!-- Contenido del post -->
    <p class="text-gray-200 whitespace-pre-wrap mb-4">{{ post.content }}</p>

    <!-- Imagen -->
    <div v-if="post.image_url" class="mb-4">
      <img :src="post.image_url" alt="Imagen del post"
        class=" w-full max-w-[500px] mx-auto object-cover rounded-lg border border-gray-700 shadow-lg" />
    </div>

    <!-- Botones de acción -->
    <div v-if="showEdit || showDelete" class="flex justify-end gap-3 mb-4">
      <button v-if="showEdit" @click="showModal = true"
        class="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-sm text-black font-semibold rounded-lg transition">
        Editar
      </button>
      <button v-if="showDelete" @click="onDelete(post.id)"
        class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-sm text-white font-semibold rounded-lg transition">
        Eliminar
      </button>
    </div>

    <!-- Comentarios -->
    <PostComments :post-id="post.id" :comments="post.comments" />


    <!-- Modal -->
    <EditPostModal :visible="showModal" :post="post" @submit="handleEditSubmit" @close="showModal = false" />
  </div>
</template>
