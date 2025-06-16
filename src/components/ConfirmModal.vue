<script>
    export default {
    props: {
        visible: Boolean,
        title: String,
        message: String
    },
    emits: ['cancel', 'confirm'],
    methods: {
        cancel() {
        this.$emit('cancel')
        },
        confirm() {
        this.$emit('confirm')
        }
    }
    }
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
  >
    <div class="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-lg font-bold mb-4">{{ title }}</h2>
      <p class="mb-4">{{ message }}</p>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg"
          @click="cancel"
        >
          Cancelar
        </button>
        <button
          class="px-4 py-1 bg-red-600 hover:bg-red-700 rounded-lg"
          @click="confirm"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>


