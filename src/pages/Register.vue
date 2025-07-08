<script>
import MainH1 from "../components/MainH1.vue";
import { register } from "../services/auth";

export default {
  name: "Register",
  components: { MainH1 },
  data() {
    return {
      user: {
        email: "",
        password: "",
        display_name: "",
        bio: "",
        career: ""
      },
      errorMsg: "",
      exito: false
    };
  },
  methods: {
    async handleSubmit() {
      this.errorMsg = "";
      this.exito = false;

      if (!this.user.display_name.trim()) {
        this.errorMsg = "El nombre es obligatorio.";
        return;
      }

      if (!this.user.email.trim()) {
        this.errorMsg = "El email es obligatorio.";
        return;
      }

      if (!this.user.password.trim()) {
        this.errorMsg = "La contraseña es obligatoria.";
        return;
      }

      if (!this.user.career.trim()) {
        this.errorMsg = "Los intereses son obligatorios.";
        return;
      }

      if (this.user.password.length < 6) {
        this.errorMsg = "La contraseña debe tener al menos 6 caracteres.";
        return;
      }

      try {
        await register(this.user.email, this.user.password, {
          display_name: this.user.display_name,
          bio: this.user.bio,
          career: this.user.career
        });

        this.exito = true;
        setTimeout(() => {
          this.$router.push({ name: "home" });
        }, 2000);
      } catch (error) {
        console.error("[Register handleSubmit] Error al registrar:", error);
        this.errorMsg = "Error al registrar. El correo puede estar en uso.";
      }
    }
  }
};
</script>


<template>
  <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
    <MainH1>Crear una Cuenta</MainH1>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label for="display_name" class="block mb-1 text-sm text-gray-300">Nombre *</label>
        <input v-model="user.display_name" type="text" id="display_name"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
      </div>

      <div>
        <label for="bio" class="block mb-1 text-sm text-gray-300">Biografía</label>
        <textarea v-model="user.bio" id="bio" rows="3"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"></textarea>
      </div>

      <div>
        <label for="career" class="block mb-1 text-sm text-gray-300">Intereses *</label>
        <input v-model="user.career" type="text" id="career"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
      </div>

      <div>
        <label for="email" class="block mb-1 text-sm text-gray-300">Email *</label>
        <input v-model="user.email" type="email" id="email"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
      </div>

      <div>
        <label for="password" class="block mb-1 text-sm text-gray-300">Contraseña *</label>
        <input v-model="user.password" type="password" id="password"
          class="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
      </div>

      <p v-if="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</p>
      <p v-if="exito" class="text-green-400 text-sm">✔ Registro exitoso. Redirigiendo...</p>

      <button type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-200">
        Crear Cuenta
      </button>
    </form>

    <p class="text-sm text-gray-400 mt-3">(*) Campo obligatorio</p>

    <div class="mt-4 text-center text-gray-300">
      <span>¿Ya tienes cuenta? </span>
      <router-link to="/ingresar" class="text-blue-400 hover:underline">Iniciar sesión</router-link>
    </div>
  </div>
</template>
