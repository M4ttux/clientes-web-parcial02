import { ref, onMounted, onUnmounted } from 'vue'
import { getCommentsByPost, addComment, subscribeToCommentsRealtime } from '../services/comments'

export function useComments(postId) {
  const comments = ref([])
  const loading = ref(true)
  const posting = ref(false)
  const error = ref(null)
  const loginWarning = ref(false)

  let channel = null

  const fetchComments = async () => {
    loading.value = true
    try {
      comments.value = await getCommentsByPost(postId)
    } catch (err) {
      console.error('Error al obtener comentarios:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const submitComment = async (content) => {
    if (!content.trim()) return
    posting.value = true
    loginWarning.value = false
    try {
      const comment = await addComment(content, postId)
      comments.value.push(comment)
    } catch (err) {
      if (err.message.includes('autenticado')) {
        loginWarning.value = true
      } else {
        console.error('Error al comentar:', err)
        error.value = err
      }
    } finally {
      posting.value = false
    }
  }

  onMounted(() => {
    fetchComments()
    channel = subscribeToCommentsRealtime(postId, (newComment) => {
      comments.value.push(newComment)
    })
  })

  onUnmounted(() => {
    if (channel) channel.unsubscribe()
  })

  return {
    comments,
    loading,
    posting,
    error,
    loginWarning,
    submitComment
  }
}
