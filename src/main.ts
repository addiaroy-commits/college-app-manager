import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import "./style.css";
import App from "./App.vue";
import { runMigration } from "./services/storageService";

// Run IndexedDB migration before mounting app
runMigration().finally(() => {
  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount("#app");
});
