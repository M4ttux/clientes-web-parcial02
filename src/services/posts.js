import supabase from "./supabase";
import { getCurrentUser } from "./auth";

/**
 * Trae todas las publicaciones con sus comentarios y perfiles de usuario.
 * @returns {Promise<Array>}
 */
export async function getAllPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
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
    `
    )
    .order("created_at", { ascending: false }); // solo ordenar publicaciones

  if (error) throw error;

  // ordenar los comentarios de cada post por fecha
  return data.map((post) => ({
    ...post,
    comments: post.comments
      ?.slice()
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
  }));
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
  const user = getCurrentUser();
  if (!user?.id) throw new Error("Usuario no autenticado");

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content,
      user_profile_id: profile.id,
      image_url: imageUrl,
    })
    .select(
      `
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
    `
    )
    .single();

  if (error) throw error;
  return data;
}

/**
 * Sube una imagen al bucket `post.imgs` y devuelve su URL pública.
 * @param {File} archivo
 * @returns {Promise<string>} URL pública de la imagen
 */
export async function uploadPostImage(archivo) {
  const user = getCurrentUser();
  if (!user?.id) throw new Error("Usuario no autenticado");

  const nombreArchivo = `${Date.now()}_${archivo.name}`;
  const ruta = `${user.id}/${nombreArchivo}`;

  const { error } = await supabase.storage
    .from("post.imgs")
    .upload(ruta, archivo);

  if (error) throw new Error("No se pudo subir la imagen: " + error.message);

  const { data } = supabase.storage.from("post.imgs").getPublicUrl(ruta);

  return data.publicUrl;
}

/**
 * Actualiza contenido y/o imagen de un post.
 * - Si se sube nueva imagen, reemplaza la anterior.
 * - Si se indica `removeImage`, la borra del storage y la base.
 * @param {string} postId
 * @param {string} newContent
 * @param {File|null} newImageFile
 * @param {boolean} removeImage
 * @returns {Promise<string|null>} Nueva URL o null
 */
export async function updatePostContentWithImage(
  postId,
  newContent,
  newImageFile = null,
  removeImage = false
) {
  const user = getCurrentUser();
  if (!user?.id) throw new Error("Usuario no autenticado");

  // Obtener post actual
  const { data: currentPost, error: fetchError } = await supabase
    .from("posts")
    .select("image_url")
    .eq("id", postId)
    .single();

  if (fetchError) throw fetchError;

  const prevImageUrl = currentPost?.image_url || null;
  let imageUrl = null;

  if (newImageFile) {
    imageUrl = await uploadPostImage(newImageFile);
  }

  const updateData = {
    content: newContent,
  };

  if (imageUrl !== null) {
    updateData.image_url = imageUrl;
  } else if (removeImage) {
    updateData.image_url = null;
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", postId);

  console.log("DEBUG: Post actualizado con imagen nueva:");
  console.log("→ Nueva URL:", imageUrl);
  console.log("→ Imagen anterior:", prevImageUrl);

  if (updateError) {
    console.error(
      "[posts.js updatePostContentWithImage] Error al actualizar post:",
      updateError
    );
    throw new Error(updateError.message);
  }

  // Eliminar imagen anterior si corresponde
  if ((newImageFile || removeImage) && prevImageUrl) {
    const ruta = getStoragePathFromUrl(prevImageUrl);
    console.log("[DEBUG] Ruta extraída de image_url previa:", ruta);
    if (ruta) {
      console.log("[DEBUG] Usuario autenticado:", user.id);
      console.log(
        "[DEBUG] ¿ruta comienza con userId? →",
        ruta?.startsWith(user.id)
      );
      const { data: deleted, error: removeError } = await supabase.storage
        .from("post.imgs")
        .remove([ruta]);
      console.log("[REMOVE RESULT] data:", deleted);
      if (removeError) {
        console.error(
          "[REMOVE ERROR] No se pudo eliminar la imagen:",
          removeError
        );
      } else {
        console.log("[REMOVE OK] Imagen eliminada correctamente:", ruta);
      }
    } else {
      console.warn(
        "[WARNING] No se pudo determinar ruta para eliminar imagen previa"
      );
    }
  }

  return imageUrl;
}

/*
 * Extrae la ruta del storage desde una URL pública de Supabase.
 *
 */

function getStoragePathFromUrl(url) {
  try {
    const bucketName = "post.imgs";
    const parts = url.split(`/object/public/${bucketName}/`);
    return parts.length === 2 ? parts[1] : null;
  } catch {
    return null;
  }
}

/**
 * Elimina un post por ID y borra su imagen del storage si tiene.
 * @param {string} postId
 */
export async function deletePostById(postId) {
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("image_url")
    .eq("id", postId)
    .single();

  if (fetchError) {
    console.error("[deletePostById] Error al obtener post:", fetchError);
    throw fetchError;
  }

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    console.error("[deletePostById] Error al eliminar post:", deleteError);
    throw deleteError;
  }

  if (post?.image_url) {
    const ruta = getStoragePathFromUrl(post.image_url);
    if (ruta) {
      await supabase.storage.from("post.imgs").remove([ruta]);
    }
  }

  console.log("Post eliminado y archivo asociado (si existía) también.");
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
    console.error(
      "[posts.js updatePostContent] Error al actualizar contenido:",
      error
    );
    throw new Error(error.message);
  }
}

/**
 * Escucha nuevos comentarios en tiempo real y ejecuta el callback.
 * @param {(comment: object) => void} callback
 */
export function subscribeToNewComments(callback) {
  supabase
    .channel("realtime-comments")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
      },
      callback
    )
    .subscribe();
}

/**
 * Escucha nuevos posts en tiempo real y ejecuta el callback.
 * @param {(post: object) => void} callback
 */
export function subscribeToNewPosts(callback) {
  supabase
    .channel("realtime-posts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "posts",
      },
      callback
    )
    .subscribe();
}

/**
 * Suscripción en tiempo real a la tabla posts y comments.
 * @param {Function} callback - Se llama con el nuevo array de publicaciones actualizado.
 */
export function subscribeToPostsRealtime(callback) {
  const channel = supabase.channel("realtime-posts-comments");

  channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      async () => {
        const updatedPosts = await getAllPosts();
        callback(updatedPosts);
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments" },
      async () => {
        const updatedPosts = await getAllPosts();
        callback(updatedPosts);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
