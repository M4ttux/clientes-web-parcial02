<script>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import MainH1 from "../components/MainH1.vue";
import PostCard from "../components/PostCard.vue";
import MainLoader from "../components/MainLoader.vue";
import {
  getUserProfileByPK,
  getPostsByUser,
  getCommentsByUser,
} from "../services/user-profile";

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

    onMounted(async () => {
      const { id } = route.params;

      try {
        profile.value = await getUserProfileByPK(id);
        posts.value = await getPostsByUser(id);
        comments.value = await getCommentsByUser(id);
      } catch (error) {
        console.error("Error al cargar perfil o datos del usuario:", error);
      } finally {
        loading.value = false;
      }
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
      <div class="bg-gray-800 text-white rounded-xl p-4 shadow mb-6 text-center">
        <!-- Imagen de perfil -->
        <div class="flex justify-center mb-4">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            alt="Foto de perfil"
            class="w-24 h-24 rounded-full border border-gray-600"
          />
        </div>

        <h2 class="text-2xl font-bold mb-1">{{ profile.display_name }}</h2>
        <p class="text-sm text-gray-400 mb-2">
          Se unió el
          {{ new Date(profile.created_at).toLocaleDateString("es-AR") }}
        </p>
        <p class="mb-2">
          <strong>Biografía:</strong> {{ profile.bio || "Sin biografía" }}
        </p>
        <p>
          <strong>Carrera:</strong> {{ profile.career || "No especificada" }}
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
      <div class="mt-8">
        <h3 class="text-xl text-white font-semibold mb-3">
          Comentarios realizados
        </h3>
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="bg-gray-700 text-white p-3 rounded-lg mb-3"
        >
          <p class="text-sm text-gray-400 mb-1">
            Comentado el
            {{ new Date(comment.created_at).toLocaleString("es-AR") }}
          </p>
          <p class="text-gray-200">{{ comment.content }}</p>
        </div>
        <p v-if="comments.length === 0" class="text-gray-400">
          Aún no comentó ninguna publicación.
        </p>
      </div>
    </div>
  </div>
</template>
