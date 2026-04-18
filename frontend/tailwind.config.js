/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#132238",
        cream: "#fff8ef",
        coral: "#ff7a59",
        pine: "#0b6b58",
        moss: "#b7e4d4",
        sand: "#f3e5cf"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(19, 34, 56, 0.16)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(255, 122, 89, 0.24), transparent 35%), radial-gradient(circle at bottom right, rgba(11, 107, 88, 0.24), transparent 30%)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        rise: "rise 700ms ease-out both"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        rise: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};
