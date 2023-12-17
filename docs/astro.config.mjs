import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://kevinanielsen.github.io/go-fast-cdn",
  integrations: [
    starlight({
      title: "Go-fast CDN",
      social: {
        github: "https://github.com/kevinanielsen/go-fast-cdn",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Usage", link: "/guides/usage/" },
            { label: "Hosting", link: "/guides/hosting/" },
          ],
        },
      ],
    }),
  ],
});
