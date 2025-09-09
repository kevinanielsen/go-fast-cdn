// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://kevinanielsen.github.io",
  base: "/go-fast-cdn",
  integrations: [
    starlight({
      title: "Go-Fast CDN",
      defaultLocale:"root",
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
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        da: {
          label: "Dansk",
          lang: "da",
        },
        es: {
          label: "Español",
          lang: "es",
        },
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
