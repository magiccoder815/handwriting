import type { Config } from "tailwindcss";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                bg: "#0b0c10",
                panel: "#15181e",
                text: "#e8eef2",
                muted: "#9aa6b2",
                brand: "#2f81f7",
            },
            boxShadow: {
                card: "0 8px 24px rgba(0,0,0,0.3)",
            },
            borderRadius: {
                xl: "16px",
            },
            letterSpacing: {
                wide2: "0.03em",
            },
        },
    },
    plugins: [],
} satisfies Config;
