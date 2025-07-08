<script>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import MainH1 from "../components/MainH1.vue";
import PostCard from "../components/PostCard.vue";
import MainLoader from "../components/MainLoader.vue";

import { getUserProfileByPK } from "../services/user-profile";
import { getPostsByUser, subscribeToPostsRealtime } from "../services/posts";
import { getCommentsByUser } from "../services/comments";

export default {
  components: {
    MainH1,
    PostCard,
    MainLoader,
  },
  setup() {
    const route = useRoute();
    const profile = ref(null);
    const posts = ref([]);
    const comments = ref([]);
    const loading = ref(true);
    let unsubscribe = null;

    const loadUserData = async (id) => {
      profile.value = await getUserProfileByPK(id);
      posts.value = await getPostsByUser(id);
      comments.value = await getCommentsByUser(id);
    };

    onMounted(async () => {
      const { id } = route.params;
      try {
        await loadUserData(id);

        unsubscribe = subscribeToPostsRealtime(async (updatedPosts) => {
          posts.value = updatedPosts.filter(p => p.user_profile_id === id);
          comments.value = await getCommentsByUser(id);
        });
      } catch (error) {
        console.error("Error al cargar perfil o datos del usuario:", error);
      } finally {
        loading.value = false;
      }
    });

    // 👇 Watch para detectar cambio de ID en la ruta (cuando se visita otro perfil)
    watch(() => route.params.id, async (newId) => {
      if (!newId) return;
      loading.value = true;
      try {
        await loadUserData(newId);
      } catch (error) {
        console.error("Error al recargar datos del usuario:", error);
      } finally {
        loading.value = false;
      }
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    return {
      profile,
      posts,
      comments,
      loading,
    };
  },
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <MainLoader v-if="loading" class="mx-auto" />

    <div v-else>
      <!-- Datos del perfil -->
      <div class="bg-gray-800 text-white rounded-lg p-4 shadow-lg mb-6 text-center">
        <div class="flex justify-center mb-4">
          <img
            :src="profile.avatar_url ? profile.avatar_url : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=4b5563&color=ffffff`"
            alt="Foto de perfil" class="w-24 h-24 rounded-full border border-gray-600" />
        </div>

        <h2 class="text-2xl font-bold mb-1">{{ profile.display_name }}</h2>
        <p class="text-sm text-gray-400 mb-2">
          Se unió el {{ new Date(profile.created_at).toLocaleDateString("es-AR") }}
        </p>
        <p class="mb-2">
          <strong>Biografía:</strong> {{ profile.bio || "Sin biografía" }}
        </p>
        <p>
          <strong>Intereses:</strong> {{ profile.career || "No especificada" }}
        </p>
      </div>

      <!-- Publicaciones -->
      <div>
        <h3 class="text-xl text-white font-semibold mb-3">Publicaciones</h3>
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
        <p v-if="posts.length === 0" class="text-gray-400">
          Este usuario aún no publicó nada.
        </p>
      </div>

      <!-- Comentarios -->
      <!-- Comentarios -->
      <div class="mt-8">
        <h3 class="text-xl text-white font-semibold mb-3">Comentarios realizados</h3>
        <div v-for="comment in comments" :key="comment.id" class="bg-gray-700 text-white p-3 rounded-lg mb-3">
          <div class="flex items-center gap-3 mb-1">
            <img
              :src="comment.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_profiles?.display_name || '')}&background=4b5563&color=ffffff`"
              alt="avatar" class="w-8 h-8 rounded-full border border-gray-500" />
            <router-link :to="{ name: 'UserProfile', params: { id: comment.user_profiles?.id } }"
              class="font-semibold text-blue-300 text-sm hover:underline">
              {{ comment.user_profiles?.display_name || 'Anónimo' }}
            </router-link>
            <span class="ml-auto text-xs text-gray-400">
              {{ new Date(comment.created_at).toLocaleString('es-AR') }}
            </span>
          </div>
          <p class="text-gray-200">{{ comment.content }}</p>
        </div>

        <p v-if="comments.length === 0" class="text-gray-400">
          Aún no comentó ninguna publicación.
        </p>
      </div>

    </div>
  </div>
</template>
