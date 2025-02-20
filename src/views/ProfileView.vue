<script>
import { subscribeToAuth } from "@/service/auth";
import { obtenerPostsDeUsuarioById } from "@/service/chatGlobal";
import chatList from "@/components/chatGlobal/chatList.vue";
import EditProfileImgView from "../components/Profile/EditProfileImg.vue";
import {
  darFollow,
  localizarLosDatosDelUsuarioLoggeadoByUsertag,
  checkFollow,
} from "@/service/users";
import ListaSeguidores from "@/components/Profile/ListaSeguidores.vue";
let unsubscribeFromAuth = () => {};

export default {
  name: "ProfileView",
  components: { chatList, EditProfileImgView, ListaSeguidores },
  data() {
    return {
      modalSeguidores: false,
      modalSeguidos: false,
      modalEdit: false,
      usertag: this.$route.params.usertag,
      myProfile: null,
      seguido: false,
      cargado: false,
      messages: [],
      userProfile: {},
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
      },
    };
  },
  watch: {
    "userLogged.email": {
      handler(newEmail) {
        if (newEmail) {
          this.loadData();
        }
      },
      immediate: true,
    },
    "$route.params.usertag": function (newUsertag) {
      this.usertag = newUsertag;
      this.modalEdit = false;
      this.modalSeguidos = false;
      this.modalSeguidores = false;
      this.loadData();
    },
  },
  async mounted() {
    unsubscribeFromAuth = subscribeToAuth((newUserData) => {
      this.userLogged = newUserData;
      this.cargado = true;
    });
  },
  async unmounted() {
    unsubscribeFromAuth();
  },
  methods: {
    closeModal() {
      this.modalEdit = false;
      this.modalSeguidores = false;
      this.modalSeguidos = false;
      console.log(this.modalSeguidores);
    },
    async loadData() {
      try {
        await localizarLosDatosDelUsuarioLoggeadoByUsertag(
          this.usertag,
          (userData) => {
            this.userProfile = userData;
          }
        );

        await obtenerPostsDeUsuarioById(this.usertag, (messagees) => {
          this.messages = messagees;
        });

        if (this.userLogged.email === this.userProfile.id_m) {
          this.myProfile = true;
        } else {
          this.myProfile = false;
        }
        await this.checkFollowStatus();

        this.cargado = false;
      } catch (err) {
        throw err;
      }
    },
    async seguir() {
      const estado = await darFollow(
        this.userLogged.email,
        this.userProfile.id_m,
        this.userLogged.usertag,
        this.userLogged.username,
        this.userLogged.photo
      );
      this.seguido = estado;
    },
    async checkFollowStatus() {
      this.seguido = await checkFollow(
        this.userLogged.usertag,
        this.userProfile.usertag
      );
    },
  },
};
</script>

<template>
  <template v-if="modalSeguidores">
    <div
      @click.self="closeModal"
      class="fixed top-0 left-1/2 z-20 translate-x-[-50%] w-full bg-white/20 min-h-screen"
    >
      <ListaSeguidores
        @close-modal="closeModal"
        :type="'Seguidores'"
        class="fixed top-[20%] left-1/2 translate-x-[-50%] w-[300px] bg-slate-950 min-h-[400px]"
        :seguidores="userProfile.seguidores_cuentas"
      />
    </div>
  </template>
  <template v-if="modalSeguidos">
    <div
      @click.self="closeModal"
      class="fixed top-0 left-1/2 z-20 translate-x-[-50%] w-full bg-white/20 min-h-screen"
    >
      <ListaSeguidores
        @close-modal="closeModal"
        :type="'Seguidos'"
        class="fixed top-[20%] left-1/2 translate-x-[-50%] w-[300px] bg-slate-950 min-h-[400px]"
        :seguidores="userProfile.seguidos_cuentas"
      />
    </div>
  </template>

  <div
    class="min-h-screen mt-10 max-w-[800px] mx-auto w-full flex flex-col gap-2"
  >
    <template v-if="this.cargado">
      <div class="relative h-screen">
        <div
          class="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div
            class="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"
          ></div>
        </div>
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div
            class="animate-spin rounded-full h-20 w-20 border-slate-900"
          ></div>
        </div>
      </div>
    </template>
    <template v-else>
      <section
        class="bg-slate-950 mb-5 pb-1 relative rounded-xl overflow-hidden min-h-[400px]"
      >
        <div
          class="banner overflow-hidden bg-black max-h-[210px] object-contain border-b border-white/10"
        >
          <img
            class="w-full h-full"
            src="../assets/img/banner-placeholder/banner-placeholder.jpeg"
            alt="Banner de usuario"
          />
        </div>

        <div
          v-if="!userProfile.photo"
          class="img-perfil absolute top-[30%] left-[10%] transform -translate-x-1/2 bg-gray-200 w-[130px] h-[130px] flex items-center justify-center rounded-full overflow-hidden"
        >
          <i
            class="fa-solid absolute bottom-[-2px] text-[106px] fa-user text-gray-500"
          ></i>
        </div>
        <div
          class="img-perfil absolute top-[30%] left-[10%] object-contain transform -translate-x-1/2 bg-gray-200 w-[130px] h-[130px] flex items-center justify-center rounded-full overflow-hidden"
          v-else
        >
          <img
            class="w-full h-full object-cover"
            :src="userProfile.photo"
            alt="Foto de perfil"
          />
        </div>

        <template v-if="myProfile">
          <div
            class="absolute top-[48%] left-[85%] flex justify-center transform -translate-x-1/2"
          >
            <!-- editar perfil -->
            <router-link
              :to="'/perfil/edit/' + this.userLogged.id"
              class="border transition-all hover:border-white w-[130px] hover:bg-green-500 hover:text-white rounded-xl flex items-center justify-evenly text-white bg-cyan-950"
            >
              Editar perfil <i class="fa-solid fa-pen"></i>
            </router-link>
          </div>
          <div
            class="absolute top-[30%] left-[10%] opacity-0 hover:opacity-70 transform -translate-x-1/2"
          >
            <button
              @click="modalEdit = true"
              class="border transition-all w-[130px] h-[130px] hover:border-white hover:text-white rounded-full flex items-center top-[30%] left-[15%] justify-center text-white bg-cyan-950"
            >
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
        </template>

        <!-- Modal para editar foto -->

        <template v-if="modalEdit">
          <EditProfileImgView @close-modal="closeModal" class="z-50" />
        </template>

        <!--  -->

        <template v-if="!myProfile">
          <div
            class="follow-button flex gap-x-2 absolute top-[48%] left-[85%] transform -translate-x-1/2"
          >
            <form action="#" @submit.prevent="seguir()">
              <template v-if="!seguido">
                <button
                  class="border rounded-full transition-all duration-300 ease-in-out hover:border-white hover:text-white hover:bg-blue-500 transform hover:scale-110 flex items-center h-10 w-10 justify-center text-white bg-cyan-950"
                >
                  <i class="fa-solid fa-user-plus"></i>
                </button>
              </template>
              <template v-else>
                <button
                  class="border rounded-full transition-all duration-300 ease-in-out hover:border-white hover:text-white hover:bg-red-500 transform hover:scale-110 flex items-center h-10 w-10 justify-center text-white bg-cyan-950"
                >
                  <i class="fa-solid fa-user-minus"></i>
                </button>
              </template>
            </form>

            <router-link
              :to="`/mensajes/${userProfile.usertag}`"
              class="border transition-all hover:border-white w-[130px] hover:bg-green-500 hover:text-white rounded-xl flex items-center justify-evenly text-white bg-cyan-950"
              >Mensaje privado</router-link
            >
          </div>
        </template>

        <div class="data-name-user flex items-center pt-[90px] pl-[29px]">
          <p class="text-2xl mr-2 text-white font-bold">
            {{ userProfile.username }}
          </p>
          <span class="text-xl text-white/50">•</span>
          <p class="ml-2 text-xl text-white/50 font-normal">
            @{{ userProfile.usertag }}
          </p>
          <span class="text-xl ml-2 text-white/50">•</span>
          <p class="text-white/50 ml-2 pt-1">{{ userProfile.rango }}</p>
        </div>

        <div class="data-name-user pt-[10px] pl-[29px] w-full text-wrap">
          <p class="mr-4 text-[1.1rem] text-white/40">Biografía:</p>
          <p class="mr-4 text-[1.1rem] text-white break-all w-[60%]">
            {{ userProfile.description }}
          </p>
        </div>

        <div
          class="followers text-lg text-white flex pt-[20px] pb-[16px] pl-[29px]"
        >
          <p class="mr-4 cursor-pointer" @click="modalSeguidores = true">
            {{ userProfile.seguidores }}
            <span class="text-white/50">Seguidores</span>
          </p>
          <p class="mr-4 cursor-pointer" @click="modalSeguidos = true">
            {{ userProfile.seguidos }}
            <span class="text-white/50">Seguidos</span>
          </p>
        </div>
      </section>

      <section class="border-t border-white/10 pt-5">
        <chatList :messages="messages" />
      </section>
    </template>
  </div>
</template>
