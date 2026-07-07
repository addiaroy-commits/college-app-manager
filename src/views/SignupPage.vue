<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
const router = useRouter();
const userStore = useUserStore();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const success = ref("");

function doSignup() {
    error.value = "";
    success.value = "";

    if (password.value !== confirmPassword.value) {
        error.value = "Passwords don't match";
        return;
    }

    const result = userStore.signup(username.value, password.value);
    if (result) {
        error.value = result;
    } else {
        success.value = "Account created! Redirecting to login...";
        // Log user in automatically
        userStore.login(username.value, password.value);
        setTimeout(() => {
            router.push("/onboarding");
        }, 1500);
    }
}
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">
            <h1 class="auth-logo">CogApp</h1>
            <p class="auth-subtitle">Create your free account</p>

            <div v-if="success" class="auth-success">{{ success }}</div>
            <div v-if="error" class="auth-error">{{ error }}</div>

            <div class="field">
                <label>Username</label>
                <input
                    v-model="username"
                    type="text"
                    placeholder="Choose a username"
                    @keyup.enter="doSignup"
                />
            </div>

            <div class="field">
                <label>Password</label>
                <input
                    v-model="password"
                    type="password"
                    placeholder="At least 4 characters"
                    @keyup.enter="doSignup"
                />
            </div>

            <div class="field">
                <label>Confirm Password</label>
                <input
                    v-model="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    @keyup.enter="doSignup"
                />
            </div>

            <button class="btn-signup" @click="doSignup">Create Account</button>

            <p class="auth-link">
                Already have an account?
                <router-link to="/login">Sign in</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped>
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ede4f6 0%, #f9fafb 100%);
}

.auth-card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.auth-logo {
    text-align: center;
    font-size: 32px;
    font-weight: 800;
    color: #1e1b4b;
    margin: 0 0 8px;
}

.auth-subtitle {
    text-align: center;
    color: #6b7280;
    margin-bottom: 28px;
    font-size: 15px;
}

.auth-error {
    background: #fee2e2;
    color: #dc2626;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
}

.auth-success {
    background: #d1fae5;
    color: #059669;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
}

.field {
    margin-bottom: 18px;
}

.field label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
}

.field input {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 15px;
    font-family: inherit;
    box-sizing: border-box;
}

.field input:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 3px rgba(30, 27, 75, 0.1);
}

.btn-signup {
    width: 100%;
    padding: 14px;
    background: #059669;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
}

.btn-signup:hover {
    background: #047857;
}

.auth-link {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #6b7280;
}

.auth-link a {
    color: #1e1b4b;
    font-weight: 600;
    text-decoration: none;
}

.auth-link a:hover {
    text-decoration: underline;
}
</style>
