import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { editarPerfilImg, localizarLosDatosDelUsuario } from "./users";
import { fileUpload, getFileURL } from "./file-storage";

let userLogged = {
  id: null,
  email: null,
  username: null,
  usertag: null,
  description: null,
  seguidores: null,
  seguidores_cuentas: null,
  seguidos: null,
  seguidos_cuentas: null,
  rango: null,
  photo: null,
};

let observers = [];

if (localStorage.getItem("user")) {
  userLogged = JSON.parse(localStorage.getItem("user"));
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userLogged.id = user.uid;
    userLogged.email = user.email;

    const fullProfile = await localizarLosDatosDelUsuario(user.email);
    userLogged.username = fullProfile.username;
    userLogged.usertag = fullProfile.usertag;
    userLogged.description = fullProfile.description;
    userLogged.seguidores = fullProfile.seguidores;
    userLogged.seguidores_cuentas = fullProfile.seguidores_cuentas;
    userLogged.seguidos = fullProfile.seguidos;
    userLogged.seguidos_cuentas = fullProfile.seguidos_cuentas;
    userLogged.rango = fullProfile.rango;
    userLogged.photo = fullProfile.photo;
    notifyAll();
    localStorage.setItem("user", JSON.stringify(userLogged));
  } else {
    userLogged.id = null;
    userLogged.email = null;
    userLogged.username = null;
    userLogged.usertag = null;
    userLogged.description = null;
    userLogged.seguidores = null;
    userLogged.seguidores_cuentas = null;
    userLogged.seguidos = null;
    userLogged.seguidos_cuentas = null;
    userLogged.rango = null;
    userLogged.photo = null;
  }
  notifyAll();
});

export function subscribeToAuth(callback) {
  observers.push(callback);
  notify(callback);
  return () => (observers = observers.filter((obs) => obs !== callback));
}

function notify(callback) {
  callback({ ...userLogged });
}

function notifyAll() {
  observers.forEach((callback) => notify(callback));
}

/**
 *
 * @param {*} {email, password}
 *
 * Esta funcion por medio de una funcion de firebase lo que hace es logear al usuario.
 */
export async function login({ email, password }) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw err;
  }
}

/**
 * Esta funcion lo que hace por medio de una funcion de firebase es cerrar la sesion y eliminar los datos del user autenticado.
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
    localStorage.removeItem("user");
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {object} {email, password}
 *
 * Esta funcion lo que hace es tomar el email y la password que ingresa el usuario y
 * mediante una funcion de Firebase se crea la cuenta.
 */
export async function register({ email, password }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;
    console.log(uid);
    return uid;
  } catch (err) {
    throw err;
  }
}
export async function editarMiFotoDePerfil(foto, param) {
  try {
    let filePath;
    if (param === "avatar") {
      filePath = `users/${userLogged.id}/avatar.jpg`;
    } else if (param === "banner") {
      filePath = `users/${userLogged.id}/banner.jpg`;
    }
    await fileUpload(filePath, foto);

    const photoURL = await getFileURL(filePath);

    if (!photoURL) {
      throw new Error(
        "La URL de la imagen es inválida o no fue generada correctamente."
      );
    }

    // Actualizar la imagen en la base de datos del usuario
    await editarPerfilImg(userLogged.email, photoURL);
  } catch (err) {
    console.error("Error al editar la foto de perfil:", err);
    throw new Error(
      "No se pudo actualizar la foto de perfil. Inténtalo de nuevo."
    );
  }
}
