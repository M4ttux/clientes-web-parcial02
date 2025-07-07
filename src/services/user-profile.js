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
  const { error } = await supabase.storage
    .from("avatars")
    .upload(nombreArchivo, archivo);

  if (error) {
    console.error(
      "[user-profile.js uploadUserAvatar] Error al subir imagen:",
      error
    );
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

/**
 * Trae el display_name del usuario por ID.
 * @param {string} userId
 * @returns {Promise<{display_name: string} | null>}
 */
export async function getUserDisplayName(userId) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[getUserDisplayName] Error al traer display_name:", error);
    return null;
  }

  return data;
}
