/*
Archivo del router de nuestra aplicación.
*/
import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import GlobalChat from "../pages/GlobalChat.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import MyProfile from "../pages/MyProfile.vue";
import MyProfileEdit from "../pages/MyProfileEdit.vue";
import CambiarPassword from "../pages/CambiarPassword.vue";
import UserProfile from "../pages/UserProfile.vue";
import supabase from "../services/supabase";

// Definimos las rutas de nuestra aplicación.
const routes = [
  { path: "/", component: Home, name: "home" },
  { path: "/ingresar", component: Login, name: "ingresar" },
  { path: "/registro", component: Register, name: "registro" },
  {
    path: "/chat-global",
    component: GlobalChat,
    meta: { requiresAuth: true }
  },
  {
    path: "/mi-perfil",
    component: MyProfile,
    name: "MyProfile",
    meta: { requiresAuth: true }
  },
  {
    path: "/mi-perfil/editar",
    component: MyProfileEdit,
    name: "MyProfileEdit",
    meta: { requiresAuth: true }
  },
  {
    path: "/cambiar-password",
    name: "CambiarPassword",
    component: CambiarPassword,
    meta: { requiresAuth: true }
  },
  {
    path: "/user/:id",
    name: "UserProfile",
    component: UserProfile
  }
];

// Creamos el router
const router = createRouter({
  history: createWebHistory(),
  routes
});

// ✅ Middleware de navegación para proteger rutas
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return "/ingresar";
    }
  }

  return true;
});

// Exportamos el router
export default router;
