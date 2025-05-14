<script>
import { ref } from 'vue'
import supabase from '../services/supabase'

export default {
  // Props que recibe el componente
  props: {
    post: {
      type: Object,
      required: true
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    onDelete: {
      type: Function,
      default: null
    }
  },

  setup(props) {
    const newComment = ref('')
    const posting = ref(false)
    const comments = ref(props.post.comments || [])
    const loginWarning = ref(false)

    /**
     * Envía un nuevo comentario al servidor.
     * Valida si hay contenido y si el usuario está autenticado.
     */
    const addComment = async () => {
      if (!newComment.value.trim()) return

      posting.value = true
      loginWarning.value = false

      // Obtener usuario actual
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        loginWarning.value = true
        posting.value = false
        return
      }

      // Obtener perfil del usuario
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      // Insertar comentario
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment.value,
            post_id: props.post.id,
            user_id: user.id,
            user_profile_id: userProfile.id
          }
        ])
        .select(`
          id,
          content,
          created_at,
          user_profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('Error al comentar:', error)
      } else {
        comments.value.push(data)
        newComment.value = ''
      }

      posting.value = false
    }

    return {
      newComment,
      addComment,
      posting,
      comments,
      loginWarning
    }
  },

  computed: {
    /**
     * Devuelve la fecha formateada del post.
     */
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
  <div class="bg-gray-800 text-white p-4 rounded-xl mb-4 shadow-md">
    <!-- Cabecera con avatar y nombre de usuario -->
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-3">
        <!-- Avatar del autor -->
        <img
          :src="post.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_profiles?.display_name)}&background=4b5563&color=ffffff`"
          alt="Avatar"
          class="w-10 h-10 rounded-full border border-gray-500"
        />

        <!-- Nombre del usuario -->
        <router-link
          v-if="post.user_profiles?.id"
          :to="{ name: 'UserProfile', params: { id: post.user_profiles.id } }"
          class="text-blue-400 hover:underline font-semibold"
        >
          {{ post.user_profiles?.display_name || 'Usuario desconocido' }}
        </router-link>
      </div>

      <!-- Fecha del post -->
      <span class="text-sm text-gray-400">{{ formattedDate }}</span>
    </div>

    <!-- Contenido del post -->
    <p class="text-gray-200 whitespace-pre-wrap mb-4">{{ post.content }}</p>

    <!-- Botón para eliminar publicación (si tiene permiso) -->
    <div v-if="showDelete && onDelete" class="flex justify-end mt-2">
      <button
        @click="onDelete(post.id)"
        class="text-sm text-red-400 hover:text-red-600"
      >
        Eliminar publicación
      </button>
    </div>

    <!-- Lista de comentarios -->
    <div v-if="comments.length > 0" class="mt-4 border-t border-gray-600 pt-3">
      <h3 class="text-sm text-gray-400 mb-2">Comentarios:</h3>

      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-gray-700 p-2 rounded mb-2"
      >
        <div class="flex items-center gap-2 mb-1">
          <!-- Avatar del comentarista -->
          <img
            :src="comment.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_profiles?.display_name)}&background=4b5563&color=ffffff`"
            class="w-8 h-8 rounded-full border border-gray-500"
          />

          <!-- Nombre y fecha -->
          <div class="flex justify-between items-center w-full">
            <span class="text-blue-300 text-sm font-semibold">
              {{ comment.user_profiles?.display_name || 'Anónimo' }}
            </span>
            <span class="text-xs text-gray-400">
              {{ new Date(comment.created_at).toLocaleString('es-AR', {
                dateStyle: 'short',
                timeStyle: 'short'
              }) }}
            </span>
          </div>
        </div>

        <!-- Contenido del comentario -->
        <p class="text-sm text-gray-200 whitespace-pre-wrap">{{ comment.content }}</p>
      </div>
    </div>

    <!-- Formulario para agregar comentario -->
    <form @submit.prevent="addComment" class="mt-4">
      <textarea
        v-model="newComment"
        rows="2"
        class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 resize-none"
        placeholder="Escribí un comentario..."
      ></textarea>
      <button
        type="submit"
        class="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold"
        :disabled="posting"
      >
        Comentar
      </button>
      <p v-if="loginWarning" class="text-red-400 text-sm mt-2">Debes estar logueado para comentar.</p>
    </form>
  </div>
</template>
