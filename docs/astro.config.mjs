// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://kevinanielsen.github.io",
  base: "/go-fast-cdn",
  i18n: {
    locales: ["en", "es", "da"],
    defaultLocale: "en",
    routing: {
        prefixDefaultLocale: false
    }
  },
  integrations: [
    starlight({
      title: "Go-Fast CDN",
      head: [
        {
          tag: "script",
          attrs: {
            defer: true,
            "data-domain": "kevinanielsen.github.io/go-fast-cdn",
            src: "https://plausible.kevinan.xyz/js/script.js",
          },
        },
      ],
      social: {
        github: "https://github.com/kevinanielsen/go-fast-cdn",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            { label: "Usage", link: "/guides/usage/" },
            { label: "Hosting", link: "/guides/hosting/" },
          ],
        },
        {
          label: "Contribution",
          items: [
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
