<script setup>
import { ref } from 'vue'
import { addComment } from '../services/comments'

const props = defineProps({
  postId: String,
  comments: Array
})

const newComment = ref('')
const posting = ref(false)
const loginWarning = ref(false)

const emit = defineEmits(['new-comment'])

async function submitComment() {
  if (!newComment.value.trim()) return
  posting.value = true
  loginWarning.value = false

  try {
    const comment = await addComment(newComment.value, props.postId)
    newComment.value = ''
    emit('new-comment', comment)
  } catch (err) {
    if (err.message.includes('autenticado')) {
      loginWarning.value = true
    } else {
      console.error('Error al comentar:', err)
    }
  }

  posting.value = false
}

</script>

<template>
  <div class="mt-5 border-t border-gray-700 pt-4">
    <h3 class="text-sm text-gray-400 mb-3">Comentarios</h3>

    <ol class="space-y-3">
      <li v-for="comment in props.comments" :key="comment.id" class="bg-gray-700 rounded-lg p-3 text-sm">
        <div class="flex items-start gap-3 mb-1">
          <img
            :src="comment.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_profiles?.display_name)}&background=4b5563&color=ffffff`"
            class="w-8 h-8 rounded-full border border-gray-600" />
          <div class="w-full">
            <div class="flex justify-between">
              <router-link :to="{ name: 'UserProfile', params: { id: comment.user_profiles.id } }"
                class="text-blue-300 font-semibold hover:underline">
                {{ comment.user_profiles.display_name }}
              </router-link>
              <span class="text-xs text-gray-400">
                {{ new Date(comment.created_at).toLocaleString('es-AR', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                }) }}
              </span>
            </div>
            <p class="text-gray-200 whitespace-pre-wrap mt-1">
              {{ comment.content }}
            </p>
          </div>
        </div>
      </li>
    </ol>

    <form @submit.prevent="submitComment" class="mt-5">
      <label for="comment" class="sr-only">Comentario</label>
      <textarea v-model="newComment" rows="2" id="comment"
        class="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-400 resize-none"
        placeholder="Escribí un comentario..."></textarea>
      <div class="flex justify-end mt-2">
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          :disabled="posting">
          Comentar
        </button>
      </div>
      <p v-if="loginWarning" class="text-red-400 text-sm mt-2 text-center">
        Debes estar logueado para comentar.
      </p>
    </form>
  </div>
</template>
