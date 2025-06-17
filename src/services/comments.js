import supabase from './supabase'
import { getCurrentUser } from './auth'

/**
 * Agrega un nuevo comentario a una publicación.
 */
export async function addComment(content, postId) {
  const user = getCurrentUser()
  if (!user?.id) throw new Error('Usuario no autenticado')

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        content,
        post_id: postId,
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

  if (error) throw error
  return data
}

/**
 * Trae todos los comentarios realizados por un usuario.
 * @param {string} userProfileId
 */
export async function getCommentsByUser(userProfileId) {
    const { data, error } = await supabase
        .from("comments")
        .select(
            `
      id,
      content,
      created_at,
      post_id,
      user_profiles (
        id,
        display_name,
        avatar_url
      )
    `
        )
        .eq("user_profile_id", userProfileId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(
            "[user-profile.js getCommentsByUser] Error al traer comentarios:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/**
 * Elimina un comentario por ID.
 * @param {string} commentId
 */
export async function deleteCommentById(commentId) {
    const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

    console.log("Resultado deleteCommentById:", { success: !error });

    if (error) {
        console.error(
            "[user-profile.js deleteCommentById] Error al eliminar el comentario:",
            error
        );
        throw new Error(error.message);
    }
}

/**
 * Suscribe a los cambios de comentarios de un usuario específico.
 * 
 */
export function subscribeToUserComments(userId, callback) {
  return supabase
    .channel('comentarios-usuario')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `user_profile_id=eq.${userId}`
    }, callback)
    .subscribe()
}
