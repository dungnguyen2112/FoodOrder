import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    // https: {r
    //   key: fs.readFileSync("localhost-key.pem"),
    //   cert: fs.readFileSync("localhost.pem"),
    // },
    port: 3000,
  },
});
