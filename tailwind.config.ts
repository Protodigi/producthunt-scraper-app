import type { Config } from 'tailwindcss'
import {nextui} from "@nextui-org/react"

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#FF6154",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#4B587C",
              foreground: "#ffffff",
            },
            success: {
              DEFAULT: "#17C964",
              foreground: "#ffffff",
            },
            warning: {
              DEFAULT: "#F5A524",
              foreground: "#ffffff",
            },
            danger: {
              DEFAULT: "#F31260",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#FF6154",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#7480A3",
              foreground: "#ffffff",
            },
            success: {
              DEFAULT: "#17C964",
              foreground: "#000000",
            },
            warning: {
              DEFAULT: "#F5A524",
              foreground: "#000000",
            },
            danger: {
              DEFAULT: "#F31260",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
}

export default config