import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./pages/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                roboto: ["var(--font-roboto)", "sans-serif"],
                poppins: ["var(--font-poppins)", "sans-serif"],
                montserrat: ["var(--font-montserrat)", "sans-serif"],
                oxanium: ["var(--font-oxanium)", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
