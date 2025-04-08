// src/store/index.js
import { createPinia } from "pinia";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth";

const pinia = createPinia();

export default pinia;
