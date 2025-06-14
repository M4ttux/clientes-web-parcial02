import supabase from './supabase'
import { getCurrentUser } from './auth'

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
