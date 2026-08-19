import React from "react";

import { Theme } from "@mui/material";

import { PureLightTheme } from "./PureLightTheme";

type ThemeColor = {
    lighter: string;
    light: string;
    main: string;
    dark: string;
};

type ThemePaletteColor = ThemeColor & {
    contrastText: string;
};

type ThemeCustomColors = {
    mutedSlate: ThemePaletteColor;
    mutedBlue: ThemePaletteColor;
    mutedIndigo: ThemePaletteColor;
    mutedViolet: ThemePaletteColor;
    mutedTeal: ThemePaletteColor;
    mutedGreen: ThemePaletteColor;
    mutedAmber: ThemePaletteColor;
    mutedRose: ThemePaletteColor;
};

export function themeCreator(theme: string): Theme {
    return themeMap[theme] || PureLightTheme;
}

declare module "@mui/material/styles" {
    interface Palette {
        mutedSlate: Palette["primary"];
        mutedBlue: Palette["primary"];
        mutedIndigo: Palette["primary"];
        mutedViolet: Palette["primary"];
        mutedTeal: Palette["primary"];
        mutedGreen: Palette["primary"];
        mutedAmber: Palette["primary"];
        mutedRose: Palette["primary"];
    }

    interface PaletteOptions {
        mutedSlate?: PaletteOptions["primary"];
        mutedBlue?: PaletteOptions["primary"];
        mutedIndigo?: PaletteOptions["primary"];
        mutedViolet?: PaletteOptions["primary"];
        mutedTeal?: PaletteOptions["primary"];
        mutedGreen?: PaletteOptions["primary"];
        mutedAmber?: PaletteOptions["primary"];
        mutedRose?: PaletteOptions["primary"];
    }

    interface Theme {
        colors: {
            gradients: {
                blue1: string;
                blue2: string;
                blue3: string;
                blue4: string;
                blue5: string;
                orange1: string;
                orange2: string;
                orange3: string;
                purple1: string;
                purple3: string;
                pink1: string;
                pink2: string;
                green1: string;
                green2: string;
                black1: string;
                black2: string;
            };
            shadows: {
                success: string;
                error: string;
                primary: string;
                warning: string;
                info: string;
                card: string;
                cardSm: string;
                cardLg: string;
            };
            alpha: {
                white: {
                    5: string;
                    10: string;
                    30: string;
                    50: string;
                    70: string;
                    100: string;
                };
                trueWhite: {
                    5: string;
                    10: string;
                    30: string;
                    50: string;
                    70: string;
                    100: string;
                };
                black: {
                    5: string;
                    10: string;
                    20: string;
                    30: string;
                    40: string;
                    50: string;
                    60: string;
                    70: string;
                    80: string;
                    90: string;
                    100: string;
                };
            };
            secondary: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            primary: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            success: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            warning: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            error: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            info: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            custom: ThemeCustomColors;
        };
        general: {
            reactFrameworkColor: React.CSSProperties["color"];
            borderRadiusSm: string;
            borderRadius: string;
            borderRadiusLg: string;
            borderRadiusXl: string;
        };
        sidebar: {
            background: React.CSSProperties["color"];
            boxShadow: React.CSSProperties["color"];
            width: string;
            textColor: React.CSSProperties["color"];
            dividerBg: React.CSSProperties["color"];
            menuItemColor: React.CSSProperties["color"];
            menuItemColorActive: React.CSSProperties["color"];
            menuItemBg: React.CSSProperties["color"];
            menuItemBgActive: React.CSSProperties["color"];
            menuItemIconColor: React.CSSProperties["color"];
            menuItemIconColorActive: React.CSSProperties["color"];
            menuItemHeadingColor: React.CSSProperties["color"];
        };
        header: {
            height: string;
            background: React.CSSProperties["color"];
            boxShadow: React.CSSProperties["color"];
            textColor: React.CSSProperties["color"];
        };
        authShell: {
            surfaceBorder: string;
            surfaceBackground: string;
            surfaceGlow: string;
            panelBackground: string;
            panelDivider: string;
            cardBackground: string;
            cardBorder: string;
            badgeBackground: string;
            badgeText: string;
            accentTitle: string;
            accentBody: string;
            title: string;
            subtitle: string;
            highlightBackground: string;
            highlightBorder: string;
            highlightText: string;
            primaryButtonBackground: string;
            primaryButtonShadow: string;
            footerText: string;
            footerLink: string;
        };
    }

    interface ThemeOptions {
        colors: {
            gradients: {
                blue1: string;
                blue2: string;
                blue3: string;
                blue4: string;
                blue5: string;
                orange1: string;
                orange2: string;
                orange3: string;
                purple1: string;
                purple3: string;
                pink1: string;
                pink2: string;
                green1: string;
                green2: string;
                black1: string;
                black2: string;
            };
            shadows: {
                success: string;
                error: string;
                primary: string;
                warning: string;
                info: string;
                card: string;
                cardSm: string;
                cardLg: string;
            };
            alpha: {
                white: {
                    5: string;
                    10: string;
                    30: string;
                    50: string;
                    70: string;
                    100: string;
                };
                trueWhite: {
                    5: string;
                    10: string;
                    30: string;
                    50: string;
                    70: string;
                    100: string;
                };
                black: {
                    5: string;
                    10: string;
                    20: string;
                    30: string;
                    40: string;
                    50: string;
                    60: string;
                    70: string;
                    80: string;
                    90: string;
                    100: string;
                };
            };
            secondary: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            primary: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            success: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            warning: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            error: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            info: {
                lighter: string;
                light: string;
                main: string;
                dark: string;
            };
            custom: ThemeCustomColors;
        };

        general: {
            reactFrameworkColor: React.CSSProperties["color"];
            borderRadiusSm: string;
            borderRadius: string;
            borderRadiusLg: string;
            borderRadiusXl: string;
        };
        sidebar: {
            background: React.CSSProperties["color"];
            boxShadow: React.CSSProperties["color"];
            width: string;
            textColor: React.CSSProperties["color"];
            dividerBg: React.CSSProperties["color"];
            menuItemColor: React.CSSProperties["color"];
            menuItemColorActive: React.CSSProperties["color"];
            menuItemBg: React.CSSProperties["color"];
            menuItemBgActive: React.CSSProperties["color"];
            menuItemIconColor: React.CSSProperties["color"];
            menuItemIconColorActive: React.CSSProperties["color"];
            menuItemHeadingColor: React.CSSProperties["color"];
        };
        header: {
            height: string;
            background: React.CSSProperties["color"];
            boxShadow: React.CSSProperties["color"];
            textColor: React.CSSProperties["color"];
        };
        authShell: {
            surfaceBorder: string;
            surfaceBackground: string;
            surfaceGlow: string;
            panelBackground: string;
            panelDivider: string;
            cardBackground: string;
            cardBorder: string;
            badgeBackground: string;
            badgeText: string;
            accentTitle: string;
            accentBody: string;
            title: string;
            subtitle: string;
            highlightBackground: string;
            highlightBorder: string;
            highlightText: string;
            primaryButtonBackground: string;
            primaryButtonShadow: string;
            footerText: string;
            footerLink: string;
        };
    }
}

declare module "@mui/material/Chip" {
    interface ChipPropsColorOverrides {
        mutedSlate: true;
        mutedBlue: true;
        mutedIndigo: true;
        mutedViolet: true;
        mutedTeal: true;
        mutedGreen: true;
        mutedAmber: true;
        mutedRose: true;
    }
}

const themeMap: { [key: string]: Theme } = {
    PureLightTheme,
};
