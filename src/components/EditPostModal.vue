<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    visible: Boolean,
    post: Object
})

const emit = defineEmits(['close', 'submit'])

const editContent = ref('')
const preview = ref(null)
let imageFile = null

watch(() => props.post, (p) => {
    editContent.value = p?.content || ''
    preview.value = p?.image_url || null
    imageFile = null
})

function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
        preview.value = URL.createObjectURL(file)
        imageFile = file
    }
}

function submit() {
    emit('submit', {
        id: props.post.id,
        content: editContent.value,
        image: imageFile
    })
}

function cancel() {
    emit('close')
}
</script>

<template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl text-white relative">
            <h2 class="text-xl font-semibold mb-4">Editar Publicación</h2>

            <textarea v-model="editContent" rows="4"
                class="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white resize-none mb-4"
                placeholder="Contenido de la publicación"></textarea>

            <div class="mb-4">
                <label class="block text-sm mb-2">Imagen (opcional)</label>
                <input type="file" accept="image/*" @change="handleFileChange"
                    class="text-sm text-gray-300 file:bg-gray-600 file:text-white file:rounded file:px-3 file:py-1 file:border-none" />
                <div v-if="preview" class="mt-2">
                    <img :src="preview" alt="Vista previa" class="rounded max-h-40 border border-gray-500" />
                </div>
            </div>

            <div class="flex justify-end gap-2">
                <button @click="cancel"
                    class="px-4 py-2 text-sm bg-gray-600 rounded hover:bg-gray-500">Cancelar</button>
                <button @click="submit" class="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-500">Guardar</button>
            </div>
        </div>
    </div>
</template>
