import { extendTheme } from "@chakra-ui/react";
import { Button } from "./components/buttons";
import { Spinner } from "./components/spinners";

const colors = {
  // only main, 100, 300, 500, 700, 900 are valid for now: rest of the shades are still being created
  primary: {
    blue: {
      dark: {
        main: "#1c3557",
        50: "#e7f1ff",
        100: "#a5bddb",
        200: "#9fbae0",
        300: "#4a658a",
        400: "#5483c4",
        500: "#1c3557",
        600: "#2d5286",
        700: "#162c4a",
        800: "#10233c",
        900: "#0c1b29",
      },
      light: {
        main: "#6080aa",
        50: "#e5f3ff",
        100: "#a5bddb",
        200: "#aabdd6",
        300: "#84a1c7",
        400: "#6988af",
        500: "#6080aa",
        600: "#3d5675",
        700: "#4973a8",
        800: "#172536",
        900: "#2d5c98",
      },
    },
    red: {
      main: "#eb5756",
      50: "#ffe5e5",
      100: "#eea7A7",
      200: "#f38d8d",
      300: "#f08080",
      400: "#e63433",
      500: "#eb5756",
      600: "#a01413",
      700: "#e54544",
      800: "#460606",
      900: "#d63130",
    },
  },
  states: {
    success: {
      main: "#6ba27d",
      50: "#e6f8ec",
      100: "#afcfb9",
      200: "#afcfb9",
      300: "#90ba9e",
      400: "#72a683",
      500: "#6ba27d",
      600: "#446e51",
      700: "#2b8b4b",
      800: "#1a3021",
      900: "#037a28",
    },
  },
};

const fonts = {
  logo: "Montserrat Alternates",
};

// we only support tablets and up
const breakpoints = {
  desktop: "1280px",
  laptop: "1024px",
  tablet: "640px",
};

/**
 * Default spacing is represented with numbers, we can expand this defnition in
 * either direction (5xs, ..., 5xl) as needed.
 */
const space = {
  "2xs": "0.25rem",
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
};

/** Customized component styles can be configured and passed to the theme provider */
const components = {
  Button,
  Spinner,
};

export const theme = extendTheme({
  colors,
  fonts,
  breakpoints,
  space,
  components,
});
