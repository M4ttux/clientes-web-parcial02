<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  post: Object
})

const emit = defineEmits(['close', 'submit'])

const editContent = ref('')
const preview = ref(null)
const imagenError = ref('')
let imageFile = null

const maxSizeKB = 300

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible && props.post) {
      editContent.value = props.post.content || ''
      preview.value = props.post.image_url || null
      imageFile = null
      imagenError.value = ''
    }
  },
  { immediate: true }
)

function handleFileChange(e) {
  const file = e.target.files[0]
  imagenError.value = ''
  if (!file) return

  if (file.size > maxSizeKB * 1024) {
    imagenError.value = `La imagen no debe superar los ${maxSizeKB} KB.`
    return
  }

  preview.value = URL.createObjectURL(file)
  imageFile = file
}

function eliminarImagen() {
  imageFile = null
  preview.value = null
  imagenError.value = ''

  const inputFile = document.getElementById('edit-imagen')
  if (inputFile) inputFile.value = ''
}

function submit() {
  emit('submit', {
    id: props.post.id,
    content: editContent.value,
    image: imageFile,
    removeImage: !preview.value && props.post.image_url
  })
}

function cancel() {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
    <div class="w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-lg p-6 relative">
      <h2 class="text-2xl font-bold text-center mb-6">Editar Publicación</h2>

      <form @submit.prevent="submit" class="space-y-5">
        <!-- Campo de texto -->
        <div>
          <label class="block text-sm font-semibold mb-1">Contenido *</label>
          <textarea v-model="editContent" rows="4"
            class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Escribí algo..." required></textarea>
        </div>

        <!-- Imagen -->
        <div>
          <label class="block text-sm font-semibold mb-1">Imagen (opcional)</label>

          <label for="edit-imagen"
            class="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-600 inline-block">
            Seleccionar Imagen
          </label>
          <input id="edit-imagen" type="file" accept="image/*" @change="handleFileChange" class="hidden" />

          <p v-if="imagenError" class="text-red-400 text-xs mt-2">{{ imagenError }}</p>

          <div v-if="preview" class="mt-3 flex items-center gap-4">
            <img :src="preview" alt="Vista previa" class="w-24 h-24 rounded-lg border-2 border-gray-600 object-cover" />
            <button @click="eliminarImagen" type="button" class="text-red-400 hover:text-red-300 text-sm underline">
              Quitar imagen
            </button>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-between pt-4">
          <button type="button" @click="cancel" class="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg">
            Cancelar
          </button>
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
