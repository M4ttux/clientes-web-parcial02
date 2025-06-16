<script>
import { ref } from 'vue'
import { addComment } from '../services/comments'

export default {
  props: {
    post: Object,
    showDelete: Boolean,
    showEdit: Boolean,
    onDelete: Function,
    onEdit: Function
  },

  setup(props) {
    const newComment = ref('')
    const posting = ref(false)
    const comments = ref(props.post.comments || [])
    const loginWarning = ref(false)

    // Modal de edición
    const showModal = ref(false)
    const editedContent = ref(props.post.content)
    const saving = ref(false)

    const submitComment = async () => {
      if (!newComment.value.trim()) return

      posting.value = true
      loginWarning.value = false

      try {
        const comment = await addComment(newComment.value, props.post.id)
        comments.value.push(comment)
        newComment.value = ''
      } catch (err) {
        if (err.message.includes('autenticado')) loginWarning.value = true
        else console.error('Error al comentar:', err)
      }

      posting.value = false
    }

    const handleSaveEdit = () => {
      saving.value = true
      props.onEdit?.(props.post.id, editedContent.value)
      showModal.value = false
      saving.value = false
    }

    return {
      newComment,
      submitComment,
      posting,
      comments,
      loginWarning,
      showModal,
      editedContent,
      handleSaveEdit,
      saving
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
  <div class="bg-gray-800 text-white p-4 rounded-lg mb-4 shadow-lg relative">
    <!-- Usuario y fecha -->
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-3">
        <img
          :src="post.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_profiles?.display_name)}&background=4b5563&color=ffffff`"
          alt="Avatar"
          class="w-10 h-10 rounded-full border border-gray-500"
        />
        <router-link
          v-if="post.user_profiles?.id"
          :to="{ name: 'UserProfile', params: { id: post.user_profiles.id } }"
          class="text-blue-400 hover:underline font-semibold"
        >
          {{ post.user_profiles?.display_name || 'Usuario desconocido' }}
        </router-link>
      </div>
      <span class="text-sm text-gray-400">{{ formattedDate }}</span>
    </div>

    <!-- Contenido -->
    <p class="text-gray-200 whitespace-pre-wrap mb-3">{{ post.content }}</p>

    <div v-if="post.image_url" class="mb-4">
      <img :src="post.image_url" alt="Imagen del post" class="rounded-lg max-h-48 mx-auto border border-gray-600 shadow" />
    </div>

    <!-- Acciones -->
    <div v-if="showDelete || showEdit" class="flex justify-end gap-3 mb-2">
      <button
        v-if="showEdit"
        @click="showModal = true"
        class="text-yellow-400 hover:text-yellow-300 text-sm underline"
      >
        Editar
      </button>
      <button
        v-if="showDelete"
        @click="onDelete(post.id)"
        class="text-red-400 hover:text-red-600 text-sm underline"
      >
        Eliminar publicación
      </button>
    </div>

    <!-- Comentarios -->
    <div v-if="comments.length > 0" class="mt-4 border-t border-gray-600 pt-3">
      <h3 class="text-sm text-gray-400 mb-2">Comentarios:</h3>
      <ol class="space-y-2">
        <li v-for="comment in comments" :key="comment.id" class="bg-gray-700 p-2 rounded-lg">
          <div class="flex items-center gap-2 mb-1">
            <img
              :src="comment.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_profiles?.display_name)}&background=4b5563&color=ffffff`"
              class="w-8 h-8 rounded-full border border-gray-500"
            />
            <div class="flex justify-between items-center w-full">
              <router-link
                :to="{ name: 'UserProfile', params: { id: comment.user_profiles.id } }"
                class="text-blue-300 text-sm font-semibold hover:underline"
              >
                {{ comment.user_profiles.display_name }}
              </router-link>
              <span class="text-xs text-gray-400">
                {{ new Date(comment.created_at).toLocaleString('es-AR', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                }) }}
              </span>
            </div>
          </div>
          <p class="text-sm text-gray-200 whitespace-pre-wrap">{{ comment.content }}</p>
        </li>
      </ol>
    </div>

    <!-- Agregar comentario -->
    <form @submit.prevent="submitComment" class="mt-4">
      <textarea
        v-model="newComment"
        rows="2"
        class="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 resize-none"
        placeholder="Escribí un comentario..."
      ></textarea>
      <button type="submit" class="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm" :disabled="posting">
        Comentar
      </button>
      <p v-if="loginWarning" class="text-red-400 text-sm mt-2">Debes estar logueado para comentar.</p>
    </form>

    <!-- Modal de edición -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-gray-900 p-6 rounded-xl max-w-md w-full border border-gray-700 shadow-lg">
        <h2 class="text-white text-lg font-semibold mb-3">Editar publicación</h2>
        <textarea
          v-model="editedContent"
          rows="4"
          class="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg mb-4 resize-none"
        ></textarea>
        <div class="flex justify-end gap-3">
          <button @click="showModal = false" class="text-gray-400 hover:text-white">Cancelar</button>
          <button
            @click="handleSaveEdit"
            :disabled="saving"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>