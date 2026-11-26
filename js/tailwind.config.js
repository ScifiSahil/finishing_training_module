/** Tailwind config. All colours come from CSS variables in src/index.css so light, dark and auto themes work with one set of classes. */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      // The original design switches to the mobile drawer at 980px
      desk: "981px",
      phone: { max: "620px" },
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        rail: "var(--rail)",
        rail2: "var(--rail2)",
        railInk: "var(--rail-ink)",
        railMute: "var(--rail-mute)",
        yellow: "var(--yellow)",
        yellowDeep: "var(--yellow-deep)",
        black: "var(--black)",
        green: "var(--green)",
        greenBg: "var(--green-bg)",
        red: "var(--red)",
        redBg: "var(--red-bg)",
        blue: "var(--blue)",
        blueBg: "var(--blue-bg)",
        chip: "var(--chip)",
        chipOn: "var(--chip-on)",
        chipOnInk: "var(--chip-on-ink)",
        onStatus: "var(--on-status)",
      },
      fontFamily: {
        head: [
          '"Barlow Condensed"',
          '"Arial Narrow"',
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        body: [
          "Barlow",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        tape: "repeating-linear-gradient(-45deg, var(--yellow) 0 10px, var(--black) 10px 20px)",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
    },
  },
  plugins: [],
};