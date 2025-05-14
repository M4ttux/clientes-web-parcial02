import supabase from './supabase';

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
 * Crea una nueva publicación y devuelve la creada.
 * @param {string} content
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function createPost(content, userId) {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      user_profile_id: profile.id
    })
    .select(`
      id,
      content,
      created_at,
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
    .single();

  if (error) throw error;
  return data;
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
