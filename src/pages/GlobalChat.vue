<script>
import { nextTick } from 'vue';
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';
import {
  getLastMessages,
  sendChatMessage,
  subscribeToGlobalChatNewMessages
} from '../services/global-chat';
import { subscribeToAuth } from '../services/auth';
import supabase from '../services/supabase';

export default {
  name: 'GlobalChat',
  components: { MainH1, MainLoader },

  data() {
    return {
      messages: [],
      loadingMessages: true,
      newMessage: {
        body: '',
      },
      user: {
        id: null,
        email: null,
        bio: null,
        display_name: null,
        career: null,
      },
      textareaRowValue: 5
    }
  },

  methods: {
    async sendMessage() {
      try {
        await sendChatMessage({
          body: this.newMessage.body,
          user_id: this.user.id
        });

        this.newMessage.body = '';
      } catch (error) {
        console.error("[GlobalChat.vue sendMessage] Error al enviar el mensaje: ", error);
      }
    },

    updateTextareaRows() {
      this.textareaRowValue = window.innerWidth < 768 ? 1 : 5;
    }
  },

  async mounted() {
    subscribeToAuth(newUser => this.user = newUser);

    subscribeToGlobalChatNewMessages(async newMessageReceived => {
      this.messages.unshift(newMessageReceived);
      await nextTick();
    });

    try {
      this.messages = await getLastMessages();
      this.loadingMessages = false;
      await nextTick();
    } catch (error) {
      console.error("Error al cargar mensajes iniciales:", error);
    }

    this.updateTextareaRows();
    window.addEventListener('resize', this.updateTextareaRows);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateTextareaRows);
  }
}
</script>

<template>
  <div class="flex items-center justify-center bg-gray-900 min-h-full px-4 py-6">
    <div class="bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg w-full max-w-6xl">
      <MainH1 class="text-white text-center mb-6">Chat Global</MainH1>

      <div class="flex flex-col md:flex-row gap-6">
        <!-- Mensajes -->
        <div ref="chatContainer"
          class="overflow-y-auto h-[50vh] md:h-[60vh] p-4 border border-gray-600 rounded-lg bg-gray-700 space-y-4 scroll-smooth w-full md:w-8/12">
          <h2 class="sr-only">Lista de Mensajes</h2>

          <MainLoader v-if="loadingMessages" class="mx-auto" />

          <ul v-else class="space-y-4">
            <li v-for="message in messages" :key="message.id" class="bg-gray-800 p-4 rounded-xl shadow-sm text-white">
              <div class="flex items-center gap-3 mb-2">
                <!-- Avatar -->
                <img
                  :src="message.user_profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + message.user_profiles?.display_name"
                  alt="Avatar"
                  class="w-10 h-10 rounded-full border border-gray-500"
                />

                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <router-link
                    :to="`/user/${message.user_profile_id}`"
                    class="text-blue-400 font-semibold hover:underline truncate"
                  >
                    {{ message.user_profiles?.display_name || 'Anónimo' }}
                  </router-link>
                  <span class="text-xs text-gray-400 mt-1 sm:mt-0">
                    {{ new Date(message.created_at).toLocaleString('es-AR', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    }) }}
                  </span>
                </div>
              </div>

              <p class="text-sm text-gray-100 whitespace-pre-wrap">{{ message.body }}</p>
            </li>
          </ul>
        </div>

        <!-- Enviar Mensaje -->
        <div class="w-full md:w-4/12 bg-gray-700 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h2 class="text-xl font-bold text-white mb-4">Nuevo mensaje</h2>
            <p class="text-sm text-gray-300 mb-1"><strong>Usuario:</strong></p>
            <p class="mb-4 font-medium text-white truncate">{{ user.email || 'No identificado' }}</p>

            <label for="body" class="block text-sm text-gray-300 mb-1">Mensaje:</label>
            <textarea id="body" :rows="textareaRowValue" v-model="newMessage.body"
              class="w-full px-4 py-2 mb-4 rounded bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe tu mensaje aquí..."></textarea>
          </div>

          <button type="submit"
            class="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200 mt-2"
            @click="sendMessage">
            Enviar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
