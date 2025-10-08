// frontend/playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30 * 1000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    headless: true, // デバッグ時は false にするとブラウザが見える
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
  },
});
