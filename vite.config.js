import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        movieDetails: resolve(__dirname, "src/pages/movieDetails.html"),
        watchlist: resolve(__dirname, "src/pages/watchlist.html"),
      },
    },
  },
});
