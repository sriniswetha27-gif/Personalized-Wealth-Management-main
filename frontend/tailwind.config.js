/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        slateLine: "#d9e0e6",
        mint: "#2fbf71",
        coral: "#ee6c4d",
        amber: "#f4a261",
        ocean: "#247ba0"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(23, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
};
