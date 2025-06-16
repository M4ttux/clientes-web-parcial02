import supabase from "./supabase";

/**
 * Crea un nuevo perfil de usuario.
 * @param {{id: string, email: string|null, bio: string|null, career: string|null}} data
 */
export async function addUserProfile(data) {
    const { error } = await supabase.from("user_profiles").insert({ ...data });

    if (error) {
        console.error(
            "[user-profile.js addUserProfile] No se pudo crear el perfil: ",
            error
        );
        throw new Error("No se pudo crear el perfil: " + error.message);
    }
}

/**
 * Actualiza el perfil del usuario.
 * @param {string} id
 * @param {{career: string|null, bio: string|null, display_name: string|null}} data
 */
export async function updateUserProfile(id, data) {
    const { error } = await supabase
        .from("user_profiles")
        .update({ ...data })
        .eq("id", id);

    if (error) {
        console.error(
            "[user-profile.js updateUserProfile] No se pudo editar el perfil: ",
            error
        );
        throw new Error("No se pudo editar el perfil: " + error.message);
    }
}

/**
 * Sube un nuevo avatar y devuelve su URL pública
 * @param {string} userId
 * @param {File} archivo
 * @returns {Promise<string>}
 */
export async function uploadUserAvatar(userId, archivo) {
  const nombreArchivo = `${userId}_${Date.now()}`;
  const { error } = await supabase.storage.from("avatars").upload(nombreArchivo, archivo);

  if (error) {
    console.error("[user-profile.js uploadUserAvatar] Error al subir imagen:", error);
    throw new Error("No se pudo subir la imagen: " + error.message);
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(nombreArchivo);
  return data.publicUrl;
}


/**
 * Trae un perfil de usuario por ID.
 * @param {string} id
 * @returns {Promise<{id: string|null, email: string|null}>}
 */
export async function getUserProfileByPK(id) {
    const { data, error } = await supabase
        .from("user_profiles")
        .select()
        .eq("id", id)
        .single();

    if (error) {
        console.error(
            "[user-profile.js getUserProfileByPK] No se pudo traer el perfil:",
            error
        );
        throw new Error("No se pudo traer el perfil: " + error.message);
    }

    return data;
}

/*
 * Trae todas las publicaciones de un usuario.
 * @param {string} userProfileId
 *
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
 * Trae todos los comentarios realizados por un usuario.
 * @param {string} userProfileId
 *
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

/*
 * Elimina un post por ID.
 * @param {string} postId
 *
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


 * Elimina un comentario por ID.
 * @param {string} commentId
 *
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
}*/
