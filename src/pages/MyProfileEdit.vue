<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainH1 from "../components/MainH1.vue";
import MainLoader from "../components/MainLoader.vue";
import {
  getUserProfileByPK,
  updateUserProfile,
} from "../services/user-profile";
import supabase from "../services/supabase";
import { cambiarPassword } from "../services/auth";

export default {
  components: {
    MainH1,
    MainLoader,
  },
  setup() {
    const router = useRouter();
    const profile = ref(null);
    const loading = ref(true);
    const saving = ref(false);
    const errorMsg = ref("");
    const nuevaPassword = ref("");

    const display_name = ref("");
    const bio = ref("");
    const career = ref("");

    onMounted(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        router.push({ name: "Login" });
        return;
      }

      try {
        const profileData = await getUserProfileByPK(user.id);
        profile.value = profileData;
        display_name.value = profileData.display_name || "";
        bio.value = profileData.bio || "";
        career.value = profileData.career || "";
      } catch (err) {
        console.error("Error al traer perfil:", err);
        errorMsg.value = "No se pudo cargar el perfil.";
      }

      loading.value = false;
    });

    const updateProfile = async () => {
      errorMsg.value = "";
      if (!display_name.value.trim()) {
        errorMsg.value = "El nombre es obligatorio.";
        return;
      }

      saving.value = true;

      try {
        await updateUserProfile(profile.value.id, {
          display_name: display_name.value,
          bio: bio.value,
          career: career.value,
        });

        // Cambiar contraseña si se ingresó una nueva
        if (nuevaPassword.value.trim() !== "") {
          if (nuevaPassword.value.length < 6) {
            errorMsg.value = "La contraseña debe tener al menos 6 caracteres.";
            saving.value = false;
            return;
          }
          await cambiarPassword(nuevaPassword.value);
        }

        router.push({ name: "MyProfile" });
      } catch (err) {
        console.error("Error al actualizar perfil:", err);
        errorMsg.value = "Hubo un error al guardar los cambios.";
      } finally {
        saving.value = false;
      }
    };

    const subirAvatar = async (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;

      const nombreArchivo = `${profile.value.id}_${Date.now()}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(nombreArchivo, archivo);

      if (error) {
        errorMsg.value = "No se pudo subir la imagen.";
        return;
      }

      const publicUrl = supabase.storage
        .from("avatars")
        .getPublicUrl(nombreArchivo).data.publicUrl;

      await updateUserProfile(profile.value.id, { avatar_url: publicUrl });
      profile.value.avatar_url = publicUrl;
    };

    return {
      display_name,
      bio,
      career,
      nuevaPassword,
      loading,
      saving,
      updateProfile,
      errorMsg,
      subirAvatar,
      profile,
    };
  },
};
</script>

<template>
  <div class="w-full max-w-xl mx-auto p-4">
    <MainH1 class="text-white text-center mb-4">Editar Perfil</MainH1>

    <MainLoader v-if="loading" class="mx-auto" />

    <form
      v-else
      @submit.prevent="updateProfile"
      class="bg-gray-800 text-white p-6 rounded-xl shadow-lg space-y-4"
    >
      <div>
        <label for="name" class="block text-sm mb-1"
          >Nombre para mostrar *</label
        >
        <input
          id="name"
          type="text"
          v-model="display_name"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
          required
        />
      </div>

      <div>
        <label for="career" class="block text-sm mb-1">Carrera</label>
        <input
          id="career"
          type="text"
          v-model="career"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      <div>
        <label for="bio" class="block text-sm mb-1">Biografía</label>
        <textarea
          id="bio"
          v-model="bio"
          rows="4"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        ></textarea>
      </div>

      <!-- Imagen actual -->
      <div class="mb-4" v-if="profile?.avatar_url">
        <img
          :src="profile.avatar_url"
          alt="Avatar"
          class="w-24 h-24 rounded-full mx-auto mb-2 border border-gray-600"
        />
      </div>

      <!-- Subida de nueva imagen -->
      <div class="mb-4">
        <label class="block text-sm mb-1 text-white">Imagen de perfil</label>
        <input
          type="file"
          @change="subirAvatar"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      <!-- Cambiar contraseña -->
      <div class="flex justify-center">
        <RouterLink
          to="/cambiar-password"
          class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
        >
          Cambiar contraseña
        </RouterLink>
      </div>

      <!-- Errores -->
      <p v-if="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</p>

<!-- Guardar + Volver -->
<div class="flex justify-center gap-4 mt-4">
  <!-- Botón Volver -->
  <RouterLink
    to="/mi-perfil"
    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
  >
    Volver al perfil
  </RouterLink>

  <!-- Botón Guardar -->
  <button
    type="submit"
    :disabled="saving"
    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
  >
    {{ saving ? "Guardando..." : "Guardar cambios" }}
  </button>
</div>

    </form>
  </div>
</template>
