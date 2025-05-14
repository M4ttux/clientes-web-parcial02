import supabase from './supabase';

/**
 * Retorna los últimos mensajes del chat, ordenados cronológicamente.
 * Incluye los datos del perfil del usuario que envió cada mensaje.
 *
 * @async
 * @function getLastMessages
 * @returns {Promise<Object[]>} Lista de mensajes con datos del usuario.
 * @throws {Error} Si ocurre un error al traer los mensajes desde Supabase.
 */
export async function getLastMessages() {
  const { data, error } = await supabase
    .from('global_chat')
    .select(`
      id,
      body,
      created_at,
      user_profile_id,
      user_profiles (
        id,
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[global-chat.js getLastMessages] Error al traer los mensajes: ', error);
    throw error;
  }

  console.log("[global-chat.js getLastMessages] Data de los mensajes: ", data);
  return data;
}

/**
 * Se suscribe a los nuevos mensajes insertados en la tabla global_chat en tiempo real.
 * Cuando se detecta un nuevo mensaje, se obtiene el mensaje completo (incluyendo user_profiles) y se pasa al callback.
 *
 * @async
 * @function subscribeToGlobalChatNewMessages
 * @param {(message: Object) => void} callback Función que se ejecutará con el mensaje nuevo completo.
 * @returns {void}
 */
export async function subscribeToGlobalChatNewMessages(callback) {
  const chatChannel = supabase.channel('global_chat');

  chatChannel.on(
    'postgres_changes',
    {
      schema: 'public',
      table: 'global_chat',
      event: 'INSERT',
    },
    async (data) => {
      console.log("¡Nuevo mensaje insertado! ID:", data.new.id);

      const { data: fullMessage, error } = await supabase
        .from('global_chat')
        .select(`
          id,
          body,
          created_at,
          user_profile_id,
          user_profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('id', data.new.id)
        .single();

      if (error) {
        console.error('[global-chat.js] Error al obtener mensaje con perfil:', error);
        return;
      }

      callback(fullMessage);
    }
  );

  chatChannel.subscribe();
}

/**
 * Inserta un nuevo mensaje en la tabla global_chat.
 *
 * @async
 * @function saveGlobalChatMessage
 * @param {{ body: string, user_id: string, user_profile_id: string }} data
 * @throws {Error} Si ocurre un error al guardar el mensaje.
 * @returns {Promise<void>}
 */
export async function saveGlobalChatMessage({ body, user_id, user_profile_id }) {
  const { error } = await supabase
    .from('global_chat')
    .insert({ body, user_id, user_profile_id });

  if (error) throw new Error(error.message);
}

/**
 * Crea y guarda un mensaje de chat usando solo el user_id.
 * Esta función se encarga de obtener automáticamente el user_profile_id correspondiente.
 *
 * @async
 * @function sendChatMessage
 * @param {{ body: string, user_id: string }} data
 * @throws {Error} Si no se encuentra el perfil o al guardar el mensaje.
 * @returns {Promise<void>}
 */
export async function sendChatMessage({ body, user_id }) {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user_id)
    .single();

  if (profileError || !profile) {
    console.error("[global-chat.js sendChatMessage] No se encontró el perfil:", profileError);
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  await saveGlobalChatMessage({
    body,
    user_id,
    user_profile_id: profile.id
  });
}
