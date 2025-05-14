# 🌐 DV Social

DV Social es una red social simple para la materia *Clientes Web Mobile*. Permite a los usuarios registrarse, publicar posts, comentar publicaciones, editar su perfil y participar en un chat global en tiempo real.

---

## 🚀 Tecnologías Utilizadas

- **Frontend:** [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- **Estilos:** [TailwindCSS](https://tailwindcss.com/)
- **Backend as a Service:** [Supabase](https://supabase.com/)

---

## 🧩 Funcionalidades

✅ Registro y autenticación de usuarios  
✅ Creación y visualización de publicaciones  
✅ Comentarios en publicaciones con actualizaciones en tiempo real  
✅ Edición de perfil (nombre, bio, carrera)  
✅ Visualización de perfiles de otros usuarios  
✅ Eliminación de publicaciones y comentarios propios  
✅ Chat global en tiempo real  
✅ Interfaz responsive y moderna con TailwindCSS  

---

## 📦 Instalación y ejecución local

1. **Clonar el repositorio**
```bash
git clone https://github.com/M4ttux/clientes_web_chat.git
cd dv-social
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**
- Crear el archivo `src/services/supabase.js` y pegar lo siguiente reemplazando las claves por las de tu proyecto:
```js
import { createClient } from '@supabase/supabase-js';

// Reemplacen con las claves de su propio proyecto Supabase
const SUPABASE_PROJECT = "https://TU_PROYECTO.supabase.co";
const SUPABASE_KEY = "TU_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_PROJECT, SUPABASE_KEY);

export default supabase;
```

4. **Ejecutar la app**
```bash
npm run dev
```

---

## 📄 Autores y Datos Académicos

**Autor:** Matias Jose Neto  
**Carrera:** Diseño y Programacion Web  
**Materia:** Clientes Web Mobile  
**Comisión:** DWT4AV  
**Docente:** Santiago Gallino  
**Año:** 2025  