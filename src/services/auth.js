import supabase from "./supabase";
import { addUserProfile, getUserProfileByPK, updateUserProfile } from "./user-profile";

// Estado global del usuario autenticado
let user = {
  id: null,
  email: null,
  bio: null,
  display_name: null,
  career: null,
};

// Observadores (subscriptores) del estado de autenticación
let observers = [];

// Cargamos automáticamente el usuario al importar este archivo
loadCurrentUser();

/**
 * Intenta cargar el usuario actual desde Supabase.
 * Si existe, actualiza el objeto `user` y carga el perfil extendido.
 */
async function loadCurrentUser() {
  const { data } = await supabase.auth.getUser();

  if (!data?.user) return null;

  updateUser({
    id: data.user.id,
    email: data.user.email,
  });

  loadCurrentUserProfile(); // Se carga de forma paralela
}

/**
 * Carga los datos del perfil extendido (display_name, bio, career, etc.).
 */
async function loadCurrentUserProfile() {
  try {
    const profile = await getUserProfileByPK(user.id);

    // Mezclamos los datos del perfil con el estado actual
    updateUser({
      ...profile,
    });
  } catch (error) {
    console.error('[auth.js loadCurrentUserProfile] Error al obtener el perfil del usuario: ', error);
    throw error;
  }
}

/**
 * Cambia la contraseña del usuario autenticado.
 * @param {string} nuevaPassword
 */
export async function cambiarPassword(nuevaPassword) {
  const { error } = await supabase.auth.updateUser({
    password: nuevaPassword
  });

  if (error) {
    console.error('[auth.js cambiarPassword] Error al cambiar la contraseña:', error);
    throw new Error(error.message);
  }
}

/**
 * Registra un nuevo usuario en Supabase y crea su perfil.
 * @param {string} email
 * @param {string} password
 * @param {{display_name: string, bio: string, career: string}} profileData
 */
export async function register(email, password, profileData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('[auth.js register] Error al registrarse: ', error);
    throw error;
  }

  try {
    // Creamos el perfil en la tabla user_profiles
    await addUserProfile({
      id: data.user.id,
      display_name: profileData.display_name,
      bio: profileData.bio,
      career: profileData.career,
    });
  } catch (error) {
    console.error('[auth.js register] Error al crear el perfil del usuario: ', error);
  }

  updateUser({
    id: data.user.id,
    email: data.user.email,
  });

  return data.user;
}

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} usuario autenticado
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[auth.js login] Error al iniciar sesión: ', error);
    throw error;
  }

  updateUser({
    id: data.user.id,
    email: data.user.email,
  });

  loadCurrentUserProfile();

  return data.user;
}

/**
 * Cierra la sesión actual.
 */
export async function logout() {
  await supabase.auth.signOut();

  // Limpiamos el estado del usuario
  updateUser({
    id: null,
    email: null,
  });
}

/**
 * Actualiza el perfil extendido del usuario autenticado.
 * @param {{display_name: string|null, bio: string|null, career: string|null}} data
 */
export async function updateAuthProfile(data) {
  try {
    await updateUserProfile(user.id, { ...data });
    updateUser(data); // Reflejamos los cambios localmente
  } catch (error) {
    console.error('[auth.js updateAuthProfile] Error al actualizar el perfil del usuario autenticado: ', error);
    throw error;
  }
}

/* -------------------------------------------------------------------
| SISTEMA DE OBSERVADORES (pub/sub pattern)
--------------------------------------------------------------------*/

/**
 * Permite que un componente se suscriba al estado del usuario autenticado.
 * @param {(user: object) => void} callback
 */
export async function subscribeToAuth(callback) {
  observers.push(callback);
  notify(callback);
}

/**
 * Ejecuta el callback pasándole el estado actual del usuario.
 * @param {(user: object) => void} callback
 */
function notify(callback) {
  callback({ ...user });
}

/**
 * Notifica a todos los observadores que el estado del usuario cambió.
 */
function notifyAll() {
  observers.forEach(callback => notify(callback));
}

/**
 * Actualiza el estado del usuario y notifica a todos los observadores.
 * @param {{id?: string|null, email?: string|null, bio?: string|null, career?: string|null, display_name?: string|null}} data
 */
function updateUser(data) {
  user = {
    ...user,
    ...data,
  };
  notifyAll();
}

export function getCurrentUser() {
  return user.id ? user : null;
}