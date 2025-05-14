import supabase from "./supabase";
import { addUserProfile, getUserProfileByPK, updateUserProfile } from "./user-profile";

// Definimos una variable para los datos del usuario, que serían nuestro "subject".
let user = {
    id: null,
    email: null,
    bio: null,
    display_name: null,
    career: null,
}
// Definimos un array para la lista de observers.
let observers = [];

// Invocamos la carga del usuario actual inmediatamente.
loadCurrentUser();

/**
 * 
 */
async function loadCurrentUser() {
    const { data } = await supabase.auth.getUser();

    // Si no hay un usuario, retornamos null.
    if(!data?.user) return null;

    // Actualizamos los datos del usuario, y notificamos a los observers.
    updateUser({
        id: data.user.id,
        email: data.user.email,
    });

    // Cargamos el perfil del usuario. Esto lo dejamos corriendo en paralelo (noten que no está el await).
    loadCurrentUserProfile();
}

/**
 * Carga el perfil extendido del usuario autenticado.
 */
async function loadCurrentUserProfile() {
    try {
        const profile = await getUserProfileByPK(user.id);
        
        updateUser({
            ...profile,
        });
    } catch (error) {
        console.error('[auth.js loadCurrentUserProfile] Error al obtener el perfil del usuario: ', error);
        throw error;
    }
}

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise}
 * @param {string} nuevaPassword
 */

export async function cambiarPassword(nuevaPassword) {
  const { error } = await supabase.auth.updateUser({
    password: nuevaPassword
  })

  if (error) {
    console.error('[auth.js cambiarPassword] Error al cambiar la contraseña:', error)
    throw new Error(error.message)
  }
}
export async function register(email, password, profileData) {
    const { data, error } = await supabase.auth.signUp({
        email, 
        password,
    });

    if(error) {
        console.error('[auth.js register] Error al registrarse: ', error);
        throw error;
    }

    // Creamos el perfil del usuario (sin email).
    try {
        await addUserProfile({
        id: data.user.id,
        display_name: profileData.display_name,
        bio: profileData.bio,
        career: profileData.career,
        });
    } catch (error) {
        console.error('[auth.js register] Error al crear el perfil del usuario: ', error);
    }

    // Actualizamos los datos del usuario, y notificamos a los observers.
    updateUser({
        id: data.user.id,
        email: data.user.email,
    });

    return data.user;
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if(error) {
        console.error('[auth.js login] Error al iniciar sesión: ', error);
        throw error;
    }

    // Actualizamos los datos del usuario, y notificamos a los observers.
    updateUser({
        id: data.user.id,
        email: data.user.email,
    });

    // Cargamos el resto del perfil.
    loadCurrentUserProfile();

    return data.user;
}

export async function logout() {
    supabase.auth.signOut();

    // Vaciamos el usuario.
    updateUser({
        id: null,
        email: null,
    });
    // user = {
    //     id: null,
    //     email: null,
    // }
    // notifyAll();
}

/**
 * Actualiza el perfil del usuario autenticado.
 * 
 * @param {{bio: string|null, career: string|null, display_name: string|null}} data 
 */
export async function updateAuthProfile(data) {
    try {
        await updateUserProfile(user.id, { ...data });
        updateUser(data);
    } catch (error) {
        console.error('[auth.js updateAuthProfile] Error al actualizar el perfil del usuario autenticado: ', error);
        throw error;
    }
}

/*--------------------------------------------------------------------
| Métodos del observer
+---------------------------------------------------------------------*/
/**
 * Registra un "observer" que será notificado con los datos del usuario cada vez que el estado de autenticación, o los
 * datos del usuario, cambien.
 * 
 * @param {({id: string|null, email: string|null}) => void} callback 
 */
export async function subscribeToAuth(callback) {
    // Guardamos el observer en el array.
    observers.push(callback);

    // Notificamos al observer de los datos actuales.
    notify(callback);
}

/**
 * Ejecuta un "observer" para notificarle el estado del usuario actual.
 * 
 * @param {({id: string|null, email: string|null}) => void} callback 
 */
function notify(callback) {
    // Invocamos el observer, y le pasamos una copia de los datos del objeto "user".
    callback({...user});
}

/**
 * Notifica a todos los observers del estado actual del "user".
 * La idea es que cada vez que "user" cambie, se notifique a todos los observers.
 */
function notifyAll() {
    observers.forEach(callback => notify(callback));
}

/**
 * Actualiza la data del usuario con la info provista, y notifica a todos los observers.
 * 
 * @param {{id: string|null, email: string|null}} data 
 */
function updateUser(data) {
    user = {
        ...user,
        ...data,
    }
    notifyAll();
}