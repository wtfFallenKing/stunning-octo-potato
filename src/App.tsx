import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { useRef } from "react";
import { theme } from "./style/theme";
import Typing from "./Typing";

function App() {
  const textInputRef = useRef(null);
  const focusTextInput = () => {
    textInputRef.current && textInputRef.current.focus();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        minWidth="100vw"
        minHeight="100vh"
        className="wrapper"
      >
        <Typing
          textInputRef={textInputRef}
          key="type-box"
          handleInputFocus={() => focusTextInput()}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
