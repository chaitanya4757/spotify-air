export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
        extend: {
    animation: {
        waveSlow: "waveSlow 10s ease-in-out infinite alternate",
        waveFast: "waveFast 6s ease-in-out infinite alternate",
    },
        keyframes: {
    waveSlow: {
        "0%": { transform: "translate(-10%, -10%) rotate(0deg)" },
        "50%": { transform: "translate(15%, 5%) rotate(4deg)" },
        "100%": { transform: "translate(-10%, -10%) rotate(0deg)" },
    },
    waveFast: {
        "0%": { transform: "translate(10%, 10%) rotate(0deg)" },
        "50%": { transform: "translate(-15%, -5%) rotate(-4deg)" },
        "100%": { transform: "translate(10%, 10%) rotate(0deg)" },
    },
}

    }
  },
  plugins: [],
};
