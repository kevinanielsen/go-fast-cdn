import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://kevinanielsen.github.io",
  base: "/go-fast-cdn",
  integrations: [
    starlight({
      title: "Go-fast CDN",
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        da: {
          label: "Dansk",
        },
        es: {
          label: "Español",
          lang: "es",
        },
      },
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
        {
          label: "Contribution",
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: "Development",
              link: "/contribution/development/",
            },
            {
              label: "Contributing",
              link: "/contribution/contributing/",
            },
          ],
        },
      ],
    }),
  ],
});
