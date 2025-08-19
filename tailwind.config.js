module.exports = {
  content: ["./src/*.{html,js}","./src/template/*.html"],
  safelist: [
    "h-[100vh]",
    "h-[100dvh]",
    "bg-blue-500",
  ],
  theme: {
    extend: {
      colors:
      {
        "bg":"#1f1f1f"
      }
    },
  },
  plugins: [],
}