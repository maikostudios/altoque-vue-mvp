<template>
    <v-container class="py-8">
        <v-card elevation="4" class="pa-6">
            <v-card-title class="text-h5 font-weight-bold">Gestión de Usuarios</v-card-title>

            <v-form @submit.prevent="registrarUsuario" class="mt-4">
                <v-text-field v-model="form.email" label="Correo electrónico" type="email" required></v-text-field>
                <v-text-field v-model="form.password" label="Contraseña" type="password" required></v-text-field>
                <v-text-field v-model="form.rut" label="RUT" required></v-text-field>
                <v-text-field v-model="form.nombre" label="Nombre completo" required></v-text-field>
                <v-text-field v-model="form.fechaNacimiento" label="Fecha de nacimiento" type="date"
                    required></v-text-field>
                <v-text-field v-model="form.comuna" label="Comuna" required></v-text-field>
                <v-text-field v-model="form.empresa" label="Empresa" required></v-text-field>

                <v-btn type="submit" color="primary" class="mt-4">Registrar Usuario</v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const form = ref({
    email: '',
    password: '',
    rut: '',
    nombre: '',
    fechaNacimiento: '',
    comuna: '',
    empresa: ''
})

function formatRut(rut) {
    return rut
        .replace(/^0+|[^0-9kK]+/g, '')
        .replace(/^(\d{1,2})(\d{3})(\d{3})([kK\d])$/, '$1.$2.$3-$4')
}

const registrarUsuario = async () => {
    try {
        const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
        const uid = cred.user.uid

        await setDoc(doc(db, 'usuarios', uid), {
            email: form.value.email,
            rut: formatRut(form.value.rut),
            nombre: form.value.nombre,
            fechaNacimiento: form.value.fechaNacimiento,
            comuna: form.value.comuna,
            empresa: form.value.empresa,
            rol: 'usuario',
            vendedor: authStore.userDisplayName || authStore.userEmail,
            fechaRegistro: serverTimestamp()
        })

        alert('Usuario registrado correctamente')
        form.value = {
            email: '', password: '', rut: '', nombre: '', fechaNacimiento: '', comuna: '', empresa: ''
        }
    } catch (e) {
        alert('Error al registrar: ' + e.message)
    }
}
</script>

<style scoped></style>