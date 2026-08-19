import React, { useState } from "react";

import { StyledEngineProvider, ThemeProvider } from "@mui/material";

import { themeCreator } from "./base";

// import { StylesProvider } from "@mui/styles";

export const ThemeContext = React.createContext((_themeName: string): void => {});

const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = (props) => {
    const curThemeName = localStorage.getItem("appTheme") || "PureLightTheme";
    const [themeName, _setThemeName] = useState(curThemeName);
    const theme = themeCreator(themeName);
    const setThemeName = (themeName: string): void => {
        localStorage.setItem("appTheme", themeName);
        _setThemeName(themeName);
    };

    return (
        <StyledEngineProvider injectFirst>
            <ThemeContext.Provider value={setThemeName}>
                <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
            </ThemeContext.Provider>
        </StyledEngineProvider>
    );
};

export default ThemeProviderWrapper;
