import supabase from './supabase';
import { getCurrentUser } from './auth'

/**
 * Trae todas las publicaciones con sus comentarios y perfiles de usuario.
 * @returns {Promise<Array>}
 */
export async function getAllPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      image_url,
      user_profile_id,
      user_profiles (
        id,
        display_name,
        avatar_url
      ),
      comments (
        id,
        content,
        created_at,
        user_profiles (
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Trae todas las publicaciones de un usuario.
 * @param {string} userProfileId
 */
export async function getPostsByUser(userProfileId) {
    const { data, error } = await supabase
        .from("posts")
        .select(
            `
      *,
      user_profiles (
        id,
        display_name,
        avatar_url
      ),
      comments (
        id,
        content,
        created_at,
        user_profiles (
          id,
          display_name,
          avatar_url
        )
      )
    `
        )
        .eq("user_profile_id", userProfileId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(
            "[user-profile.js getPostsByUser] Error al traer publicaciones:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/**
 * Crea una nueva publicación y devuelve la creada.
 * @param {string} content
 * @returns {Promise<Object>}
 */
export async function createPost(content, imageUrl = null) {
  const user = getCurrentUser()
  if (!user?.id) throw new Error('Usuario no autenticado')

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      user_profile_id: profile.id,
      image_url: imageUrl
    })
    .select(`
      id,
      content,
      created_at,
      image_url,
      user_profile_id,
      user_profiles (
        id,
        display_name,
        avatar_url
      ),
      comments (
        id,
        content,
        created_at,
        user_profiles (
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Sube una imagen al bucket `post.imgs` y devuelve su URL pública.
 * @param {File} archivo
 * @returns {Promise<string>} URL pública de la imagen
 */
export async function uploadPostImage(archivo) {
  const user = getCurrentUser()
  if (!user?.id) throw new Error('Usuario no autenticado')

  const nombreArchivo = `${Date.now()}_${archivo.name}`
  const ruta = `${user.id}/${nombreArchivo}`

  const { error } = await supabase.storage
    .from('post.imgs')
    .upload(ruta, archivo)

  if (error) throw new Error('No se pudo subir la imagen: ' + error.message)

  const { data } = supabase.storage
    .from('post.imgs')
    .getPublicUrl(ruta)

  return data.publicUrl
}

/**
 * Elimina un post por ID.
 * @param {string} postId
 */
export async function deletePostById(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    console.log("Resultado deletePostById:", { success: !error });

    if (error) {
        console.error(
            "[user-profile.js deletePostById] Error al eliminar el post:",
            error
        );
        throw new Error(error.message);
    }
}

/**
 * Actualiza un post por ID.
 * @param {string} postId
 * @param {string} newContent
 */
export async function updatePostContent(postId, newContent) {
  const { error } = await supabase
    .from("posts")
    .update({ content: newContent })
    .eq("id", postId);

  if (error) {
    console.error("[posts.js updatePostContent] Error al actualizar contenido:", error);
    throw new Error(error.message);
  }
}

/**
 * Escucha nuevos comentarios en tiempo real y ejecuta el callback.
 * @param {(comment: object) => void} callback
 */
export function subscribeToNewComments(callback) {
  supabase
    .channel('realtime-comments')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'comments'
    }, callback)
    .subscribe();
}

/**
 * Escucha nuevos posts en tiempo real y ejecuta el callback.
 * @param {(post: object) => void} callback
 */
export function subscribeToNewPosts(callback) {
  supabase
    .channel('realtime-posts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'posts'
    }, callback)
    .subscribe();
}
