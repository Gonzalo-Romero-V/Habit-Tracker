import type { CapacitorConfig } from "@capacitor/cli";

// appId debe coincidir exacto con android_client_info.package_name en
// android/app/google-services.json — Firebase valida esto al recibir
// pushes (ver decisions/stack.md → Empaquetado Android).
const config: CapacitorConfig = {
  appId: "dev.gonzaloromero.habittracker",
  appName: "Habit Tracker",
  webDir: "out",
};

export default config;
