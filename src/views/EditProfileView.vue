<script>
import { subscribeToAuth } from "@/service/auth";
import { editarPerfil } from "@/service/users";
import error from "@/components/slot/error.vue";
let unsubscribeFromAuth = () => {};

export default {
  name: "EditProfileView",
  components: { error },
  data() {
    return {
      paramId: "",
      userLogged: {
        id: "",
        email: "",
        username: "",
        usertag: "",
        description: "",
        seguidores: null,
        seguidores_cuentas: null,
        seguidos: null,
        seguidos_cuentas: null,
        rango: null,
      },
      editProfile: {
        rango: "",
        username: "",
        description: "",
      },
      errors: {
        rango: "",
        username: "",
        description: "",
      },
    };
  },
  mounted() {
    unsubscribeFromAuth = subscribeToAuth((newUserData) => {
      if (newUserData) {
        this.userLogged = newUserData;
        this.editProfile.username = this.userLogged.username || "";
        this.editProfile.description = this.userLogged.description || "";
        this.editProfile.rango = this.userLogged.rango || "";

        if (this.userLogged.id !== this.$route.params.id) {
          this.$router.push("/");
        }
      }
    });
  },
  async unmounted() {
    unsubscribeFromAuth();
  },
  methods: {
    async envioDeFormulario() {
      let flag = false;

      if (!this.editProfile.username) {
        flag = true;
        this.errors.username = "El nombre no puede estar vacío.";
      } else if (!this.editProfile.username.length > 3) {
        flag = true;
        this.errors.username = "El nombre debe tener más de 3 caracteres.";
      }

      if (!this.editProfile.description) {
        flag = true;
        this.errors.description = "La descripción no puede estar vacía.";
      } else if (this.editProfile.description.length > 150) {
        flag = true;
        this.errors.description =
          "La descripción no puede exceder los 150 caracteres.";
      }

      if (!flag) {
        try {
          await editarPerfil(
            this.userLogged.email,
            this.editProfile.description,
            this.editProfile.username,
            this.editProfile.rango
          );
          this.$router.push("/perfil/" + this.userLogged.usertag);
        } catch (err) {
          throw err;
        }
      }
    },
  },
};
</script>

<template>
  <section class="bg-slate-950 mx-auto max-w-[600px] mt-10 rounded-xl">
    <div class="flex justify-between w-full py-4">
      <div class="w-[600px]">
        <div class="w-full flex item-center justify-center">
          <h2 class="font-semibold text-2xl pt-5 py-2 text-white">
            Editar Perfil
          </h2>
        </div>
        <form class="p-8" action="#" @submit.prevent="envioDeFormulario()">
          <div class="mb-4">
            <label for="username" class="text-white block mb-2">Nombre</label>
            <input
              type="text"
              name="username"
              v-model="editProfile.username"
              class="w-full p-2 border rounded"
            />
            <template v-if="errors.username !== ''">
              <error>{{ errors.username }}</error>
            </template>
          </div>

          <div class="mb-4">
            <label for="rango" class="text-white block mb-2">Rol</label>
            <select
              name="rango"
              v-model="editProfile.rango"
              class="w-full p-2 border rounded"
            >
              <option value="Fullstack">Fullstack</option>
              <option value="Front-end">Front-end</option>
              <option value="Back-end">Back-end</option>
              <option value="DevOps">DevOps</option>
              <option value="Mobile Developer">Mobile Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Data Engineer">Data Engineer</option>
              <option value="Machine Learning Engineer">
                Machine Learning Engineer
              </option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Web Developer">Web Developer</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Game Developer">Game Developer</option>
              <option value="Cloud Engineer">Cloud Engineer</option>
              <option value="Blockchain Developer">Blockchain Developer</option>
              <option value="Security Engineer">Security Engineer</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="Systems Architect">Systems Architect</option>
            </select>
          </div>

          <div class="mb-4">
            <label for="description" class="text-white block mb-2"
              >Descripción</label
            >
            <textarea
              name="description"
              v-model="editProfile.description"
              class="w-full h-28 resize-none border-slate-900 border rounded py-2 px-4 text-slate-900 focus:border-slate-950"
            >
{{}}</textarea
            >
            <template v-if="errors.description !== ''">
              <error>{{ errors.description }}</error>
            </template>
          </div>
          <button
            class="py-2 mt-8 w-full rounded bg-cyan-950 text-white hover:bg-cyan-700 transition-all"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
