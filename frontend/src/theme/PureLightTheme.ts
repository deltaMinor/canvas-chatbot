import { alpha, createTheme, darken, lighten } from "@mui/material";

const themeColors = {
    primary: "#5569ff",
    secondary: "#6E759F",
    success: "#57CA22",
    warning: "#FFA319",
    error: "#FF1943",
    info: "#33C2FF",
    black: "#223354",
    white: "#ffffff",
    primaryAlt: "#000C57",
    highlight: "#FFF59D",
};

const createMutedColor = (main: string, dark: string, contrastText: string) => ({
    lighter: alpha(main, 0.45),
    light: alpha(main, 0.72),
    main,
    dark,
    contrastText,
});

export const colors = {
    gradients: {
        blue1: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
        blue2: "linear-gradient(135deg, #ABDCFF 0%, #0396FF 100%)",
        blue3: "linear-gradient(127.55deg, #141E30 3.73%, #243B55 92.26%)",
        blue4: "linear-gradient(-20deg, #2b5876 0%, #4e4376 100%)",
        blue5: "linear-gradient(135deg, #97ABFF 10%, #123597 100%)",
        orange1: "linear-gradient(135deg, #FCCF31 0%, #F55555 100%)",
        orange2: "linear-gradient(135deg, #FFD3A5 0%, #FD6585 100%)",
        orange3: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
        purple1: "linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)",
        purple3: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pink1: "linear-gradient(135deg, #F6CEEC 0%, #D939CD 100%)",
        pink2: "linear-gradient(135deg, #F761A1 0%, #8C1BAB 100%)",
        green1: "linear-gradient(135deg, #FFF720 0%, #3CD500 100%)",
        green2: "linear-gradient(to bottom, #00b09b, #96c93d)",
        black1: "linear-gradient(100.66deg, #434343 6.56%, #000000 93.57%)",
        black2: "linear-gradient(60deg, #29323c 0%, #485563 100%)",
    },
    shadows: {
        success: "0px 1px 4px rgba(68, 214, 0, 0.25), 0px 3px 12px 2px rgba(68, 214, 0, 0.35)",
        error: "0px 1px 4px rgba(255, 25, 67, 0.25), 0px 3px 12px 2px rgba(255, 25, 67, 0.35)",
        info: "0px 1px 4px rgba(51, 194, 255, 0.25), 0px 3px 12px 2px rgba(51, 194, 255, 0.35)",
        primary: "0px 1px 4px rgba(85, 105, 255, 0.25), 0px 3px 12px 2px rgba(85, 105, 255, 0.35)",
        warning: "0px 1px 4px rgba(255, 163, 25, 0.25), 0px 3px 12px 2px rgba(255, 163, 25, 0.35)",
        card: "0px 9px 16px rgba(159, 162, 191, .18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
        cardSm: "0px 2px 3px rgba(159, 162, 191, .18), 0px 1px 1px rgba(159, 162, 191, 0.32)",
        cardLg: "0 5rem 14rem 0 rgb(255 255 255 / 30%), 0 0.8rem 2.3rem rgb(0 0 0 / 60%), 0 0.2rem 0.3rem rgb(0 0 0 / 45%)",
    },
    layout: {
        general: {
            bodyBg: "#f2f5f9",
        },
        sidebar: {
            background: themeColors.white,
            textColor: themeColors.secondary,
            dividerBg: "#f2f5f9",
            menuItemColor: "#242E6F",
            menuItemColorActive: themeColors.primary,
            menuItemBg: themeColors.white,
            menuItemBgActive: "#f2f5f9",
            menuItemIconColor: lighten(themeColors.secondary, 0.3),
            menuItemIconColorActive: themeColors.primary,
            menuItemHeadingColor: darken(themeColors.secondary, 0.3),
        },
    },
    alpha: {
        white: {
            5: alpha(themeColors.white, 0.05),
            10: alpha(themeColors.white, 0.1),
            20: alpha(themeColors.white, 0.2),
            30: alpha(themeColors.white, 0.3),
            40: alpha(themeColors.white, 0.4),
            50: alpha(themeColors.white, 0.5),
            60: alpha(themeColors.white, 0.6),
            70: alpha(themeColors.white, 0.7),
            80: alpha(themeColors.white, 0.8),
            90: alpha(themeColors.white, 0.9),
            100: themeColors.white,
        },
        trueWhite: {
            5: alpha(themeColors.white, 0.05),
            10: alpha(themeColors.white, 0.1),
            20: alpha(themeColors.white, 0.2),
            30: alpha(themeColors.white, 0.3),
            40: alpha(themeColors.white, 0.4),
            50: alpha(themeColors.white, 0.5),
            60: alpha(themeColors.white, 0.6),
            70: alpha(themeColors.white, 0.7),
            80: alpha(themeColors.white, 0.8),
            90: alpha(themeColors.white, 0.9),
            100: themeColors.white,
        },
        black: {
            5: alpha(themeColors.black, 0.05),
            10: alpha(themeColors.black, 0.1),
            20: alpha(themeColors.black, 0.2),
            30: alpha(themeColors.black, 0.3),
            40: alpha(themeColors.black, 0.4),
            50: alpha(themeColors.black, 0.5),
            60: alpha(themeColors.black, 0.6),
            70: alpha(themeColors.black, 0.7),
            80: alpha(themeColors.black, 0.8),
            90: alpha(themeColors.black, 0.9),
            100: themeColors.black,
        },
    },
    secondary: {
        lighter: lighten(themeColors.secondary, 0.85),
        light: lighten(themeColors.secondary, 0.25),
        main: themeColors.secondary,
        dark: darken(themeColors.secondary, 0.2),
    },
    primary: {
        ultralight: lighten(themeColors.primary, 0.95),
        lighter: lighten(themeColors.primary, 0.85),
        light: lighten(themeColors.primary, 0.3),
        main: themeColors.primary,
        dark: darken(themeColors.primary, 0.2),
    },
    success: {
        lighter: lighten(themeColors.success, 0.85),
        light: lighten(themeColors.success, 0.3),
        main: themeColors.success,
        dark: darken(themeColors.success, 0.2),
    },
    warning: {
        lighter: lighten(themeColors.warning, 0.85),
        light: lighten(themeColors.warning, 0.3),
        main: themeColors.warning,
        dark: darken(themeColors.warning, 0.2),
    },
    error: {
        lighter: lighten(themeColors.error, 0.85),
        light: lighten(themeColors.error, 0.3),
        main: themeColors.error,
        dark: darken(themeColors.error, 0.2),
    },
    info: {
        lighter: lighten(themeColors.info, 0.85),
        light: lighten(themeColors.info, 0.3),
        main: themeColors.info,
        dark: darken(themeColors.info, 0.2),
    },
    highlight: {
        lighter: lighten(themeColors.highlight, 0.85),
        light: lighten(themeColors.highlight, 0.3),
        main: themeColors.highlight,
        dark: darken(themeColors.highlight, 0.2),
    },
    custom: {
        mutedSlate: createMutedColor("#E2E8F0", "#475569", "#334155"),
        mutedBlue: createMutedColor("#DBEAFE", "#2563EB", "#1E40AF"),
        mutedIndigo: createMutedColor("#E0E7FF", "#4F46E5", "#3730A3"),
        mutedViolet: createMutedColor("#EDE9FE", "#7C3AED", "#5B21B6"),
        mutedTeal: createMutedColor("#CCFBF1", "#0F766E", "#115E59"),
        mutedGreen: createMutedColor("#DCFCE7", "#16A34A", "#166534"),
        mutedAmber: createMutedColor("#FEF3C7", "#D97706", "#92400E"),
        mutedRose: createMutedColor("#FFE4E6", "#E11D48", "#9F1239"),
    },
};

export const PureLightTheme = createTheme({
    // direction: i18n.dir(),
    colors: {
        gradients: {
            blue1: colors.gradients.blue1,
            blue2: colors.gradients.blue2,
            blue3: colors.gradients.blue3,
            blue4: colors.gradients.blue4,
            blue5: colors.gradients.blue5,
            orange1: colors.gradients.orange1,
            orange2: colors.gradients.orange2,
            orange3: colors.gradients.orange3,
            purple1: colors.gradients.purple1,
            purple3: colors.gradients.purple3,
            pink1: colors.gradients.pink1,
            pink2: colors.gradients.pink2,
            green1: colors.gradients.green1,
            green2: colors.gradients.green2,
            black1: colors.gradients.black1,
            black2: colors.gradients.black2,
        },
        shadows: {
            success: colors.shadows.success,
            error: colors.shadows.error,
            primary: colors.shadows.primary,
            info: colors.shadows.info,
            warning: colors.shadows.warning,
            card: colors.shadows.card,
            cardSm: colors.shadows.cardSm,
            cardLg: colors.shadows.cardLg,
        },
        alpha: colors.alpha,
        secondary: {
            lighter: alpha(themeColors.secondary, 0.1),
            light: lighten(themeColors.secondary, 0.3),
            main: themeColors.secondary,
            dark: darken(themeColors.secondary, 0.2),
        },
        primary: {
            lighter: alpha(themeColors.primary, 0.1),
            light: lighten(themeColors.primary, 0.3),
            main: themeColors.primary,
            dark: darken(themeColors.primary, 0.2),
        },
        success: {
            lighter: alpha(themeColors.success, 0.1),
            light: lighten(themeColors.success, 0.3),
            main: themeColors.success,
            dark: darken(themeColors.success, 0.2),
        },
        warning: {
            lighter: alpha(themeColors.warning, 0.1),
            light: lighten(themeColors.warning, 0.3),
            main: themeColors.warning,
            dark: darken(themeColors.warning, 0.2),
        },
        error: {
            lighter: alpha(themeColors.error, 0.1),
            light: lighten(themeColors.error, 0.3),
            main: themeColors.error,
            dark: darken(themeColors.error, 0.2),
        },
        info: {
            lighter: alpha(themeColors.info, 0.1),
            light: lighten(themeColors.info, 0.3),
            main: themeColors.info,
            dark: darken(themeColors.info, 0.2),
        },
        custom: colors.custom,
    },
    general: {
        reactFrameworkColor: "#00D8FF",
        borderRadiusSm: "6px",
        borderRadius: "10px",
        borderRadiusLg: "12px",
        borderRadiusXl: "16px",
    },
    sidebar: {
        background: colors.layout.sidebar.background,
        textColor: colors.layout.sidebar.textColor,
        dividerBg: colors.layout.sidebar.dividerBg,
        menuItemColor: colors.layout.sidebar.menuItemColor,
        menuItemColorActive: colors.layout.sidebar.menuItemColorActive,
        menuItemBg: colors.layout.sidebar.menuItemBg,
        menuItemBgActive: colors.layout.sidebar.menuItemBgActive,
        menuItemIconColor: colors.layout.sidebar.menuItemIconColor,
        menuItemIconColorActive: colors.layout.sidebar.menuItemIconColorActive,
        menuItemHeadingColor: colors.layout.sidebar.menuItemHeadingColor,
        boxShadow: "2px 0 3px rgba(159, 162, 191, .18), 1px 0 1px rgba(159, 162, 191, 0.32)",
        width: "250px",
    },
    header: {
        height: "60px",
        background: colors.alpha.white[100],
        boxShadow: colors.shadows.cardSm,
        textColor: colors.secondary.main,
    },
    authShell: {
        surfaceBorder: alpha(colors.alpha.trueWhite[100], 0.78),
        surfaceBackground: `linear-gradient(135deg, ${alpha("#ffffff", 0.98)} 0%, ${alpha(
            "#f6f8ff",
            0.96
        )} 52%, ${alpha("#eef3ff", 0.94)} 100%)`,
        surfaceGlow: `
            radial-gradient(circle at top right, ${alpha(colors.info.main, 0.08)}, transparent 24%),
            radial-gradient(circle at bottom left, ${alpha(colors.primary.light, 0.1)}, transparent 20%),
            radial-gradient(circle at 20% 18%, ${alpha(colors.warning.light, 0.08)}, transparent 18%)
        `,
        panelBackground: alpha("#ffffff", 0.72),
        panelDivider: alpha(colors.alpha.black[100], 0.08),
        cardBackground: alpha("#ffffff", 0.94),
        cardBorder: alpha(colors.alpha.black[100], 0.08),
        badgeBackground: alpha(colors.primary.main, 0.08),
        badgeText: alpha(colors.primary.dark, 0.88),
        accentTitle: alpha(colors.alpha.black[100], 0.94),
        accentBody: alpha(colors.alpha.black[100], 0.68),
        title: alpha(colors.alpha.black[100], 0.9),
        subtitle: alpha(colors.alpha.black[100], 0.64),
        highlightBackground: alpha(colors.primary.main, 0.04),
        highlightBorder: alpha(colors.primary.main, 0.08),
        highlightText: alpha(colors.alpha.black[100], 0.84),
        primaryButtonBackground: "linear-gradient(135deg, #7dd3fc 0%, #4f7cff 52%, #4c6fff 100%)",
        primaryButtonShadow: "0 16px 34px rgba(79, 124, 255, 0.22)",
        footerText: alpha(colors.alpha.black[100], 0.62),
        footerLink: "#4366f5",
    },
    spacing: 9,
    palette: {
        common: {
            black: colors.alpha.black[100],
            white: colors.alpha.white[100],
        },
        mode: "light",
        primary: {
            light: colors.primary.light,
            main: colors.primary.main,
            dark: colors.primary.dark,
        },
        secondary: {
            light: colors.secondary.light,
            main: colors.secondary.main,
            dark: colors.secondary.dark,
        },
        error: {
            light: colors.error.light,
            main: colors.error.main,
            dark: colors.error.dark,
            contrastText: colors.alpha.white[100],
        },
        success: {
            light: colors.success.light,
            main: colors.success.main,
            dark: colors.success.dark,
            contrastText: colors.alpha.white[100],
        },
        info: {
            light: colors.info.light,
            main: colors.info.main,
            dark: colors.info.dark,
            contrastText: colors.alpha.white[100],
        },
        warning: {
            light: colors.warning.light,
            main: colors.warning.main,
            dark: colors.warning.dark,
            contrastText: colors.alpha.white[100],
        },
        mutedSlate: colors.custom.mutedSlate,
        mutedBlue: colors.custom.mutedBlue,
        mutedIndigo: colors.custom.mutedIndigo,
        mutedViolet: colors.custom.mutedViolet,
        mutedTeal: colors.custom.mutedTeal,
        mutedGreen: colors.custom.mutedGreen,
        mutedAmber: colors.custom.mutedAmber,
        mutedRose: colors.custom.mutedRose,
        text: {
            primary: colors.alpha.black[100],
            secondary: colors.alpha.black[70],
            disabled: colors.alpha.black[50],
        },
        background: {
            paper: colors.alpha.white[100],
            default: colors.layout.general.bodyBg,
        },
        action: {
            active: colors.alpha.black[100],
            hover: colors.primary.lighter,
            hoverOpacity: 0.1,
            selected: colors.alpha.black[10],
            selectedOpacity: 0.1,
            disabled: colors.alpha.black[50],
            disabledBackground: colors.alpha.black[5],
            disabledOpacity: 0.38,
            focus: colors.alpha.black[10],
            focusOpacity: 0.05,
            activatedOpacity: 0.12,
        },
        tonalOffset: 0.5,
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1840,
        },
    },
    components: {
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    // backgroundColor: alpha(darken(themeColors.primaryAlt, 0.4), 0.2),
                    // backdropFilter: "blur(2px)",
                    // "&.MuiBackdrop-invisible": {
                    //     backgroundColor: "transparent",
                    //     backdropFilter: "blur(2px)",
                    // },
                },
            },
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    marginLeft: 8,
                    marginRight: 8,
                    fontWeight: "bold",
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                "html, body": {
                    width: "100%",
                    height: "100%",
                },
                body: {
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100%",
                    width: "100%",
                    flex: 1,
                },
                "#root": {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                },
                html: {
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100%",
                    width: "100%",
                    MozOsxFontSmoothing: "grayscale",
                    WebkitFontSmoothing: "antialiased",
                },
                ".child-popover .MuiPaper-root .MuiList-root": {
                    flexDirection: "column",
                },
                "#nprogress": {
                    pointerEvents: "none",
                },
                "#nprogress .bar": {
                    background: colors.primary.lighter,
                },
                "#nprogress .spinner-icon": {
                    borderTopColor: colors.primary.lighter,
                    borderLeftColor: colors.primary.lighter,
                },
                "#nprogress .peg": {
                    boxShadow:
                        "0 0 15px " + colors.primary.lighter + ", 0 0 8px" + colors.primary.light,
                },
                ":root": {
                    "--swiper-theme-color": colors.primary.main,
                },
                code: {
                    background: colors.info.lighter,
                    color: colors.info.dark,
                    borderRadius: 4,
                    padding: 4,
                },
                "@keyframes ripple": {
                    "0%": {
                        transform: "scale(.8)",
                        opacity: 1,
                    },
                    "100%": {
                        transform: "scale(2.8)",
                        opacity: 0,
                    },
                },
                "@keyframes float": {
                    "0%": {
                        transform: "translate(0%, 0%)",
                    },
                    "100%": {
                        transform: "translate(3%, 3%)",
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                iconOutlined: {
                    color: colors.alpha.black[50],
                },
                icon: {
                    top: "calc(50% - 14px)",
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiInputAdornment-positionEnd.MuiInputAdornment-outlined": {
                        paddingRight: 6,
                    },
                    // "&:hover .MuiOutlinedInput-notchedOutline": {
                    //     borderColor: colors.alpha.black[50],
                    // },
                    // "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
                    //     borderColor: colors.primary.main,
                    // },
                },
            },
        },
        MuiListSubheader: {
            styleOverrides: {
                colorPrimary: {
                    fontWeight: "bold",
                    lineHeight: "40px",
                    fontSize: 14,
                    background: colors.alpha.black[5],
                    color: colors.alpha.black[70],
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                action: {
                    marginTop: -5,
                    marginBottom: -5,
                },
                title: {
                    fontSize: 15,
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    borderRadius: "50px",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                colorSecondary: {
                    background: colors.alpha.black[5],
                    color: colors.alpha.black[100],

                    "&:hover": {
                        background: colors.alpha.black[10],
                    },
                },
                deleteIcon: {
                    color: colors.error.light,

                    "&:hover": {
                        color: colors.error.main,
                    },
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    boxShadow: "none",

                    "&.Mui-expanded": {
                        margin: 0,
                    },
                    "&::before": {
                        display: "none",
                    },
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    // fontSize: 14,
                    fontWeight: "bold",
                },
                colorDefault: {
                    background: colors.alpha.black[30],
                    color: colors.alpha.white[100],
                },
            },
        },
        MuiAvatarGroup: {
            styleOverrides: {
                root: {
                    alignItems: "center",
                },
                avatar: {
                    background: colors.alpha.black[10],
                    fontSize: 14,
                    color: colors.alpha.black[70],
                    fontWeight: "bold",
                    "&:first-of-type": {
                        border: 0,
                        background: "transparent",
                    },
                },
            },
        },
        MuiListItemAvatar: {
            styleOverrides: {
                alignItemsFlexStart: {
                    marginTop: 0,
                },
            },
        },
        MuiPaginationItem: {
            styleOverrides: {
                page: {
                    fontSize: 14,
                    fontWeight: "bold",
                    transition: "all .2s",
                },
                textPrimary: {
                    "&.Mui-selected": {
                        boxShadow: colors.shadows.primary,
                    },
                    "&.MuiButtonBase-root:hover": {
                        background: colors.alpha.black[5],
                    },
                    "&.MuiButtonBase-root.Mui-selected:hover": {
                        background: colors.primary.main,
                    },
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {
                root: {
                    fontWeight: "bold",
                    textTransform: "none",
                    paddingLeft: 16,
                    paddingRight: 16,

                    ".MuiSvgIcon-root": {
                        transition: "all .2s",
                        width: "24px",
                        height: "24px",
                    },
                },
                endIcon: {
                    marginRight: -8,
                },
                containedSecondary: {
                    backgroundColor: colors.secondary.main,
                    color: colors.alpha.white[100],
                    border: "1px solid " + colors.alpha.black[30],
                    "&:hover, &.MuiSelected": {
                        color: colors.alpha.white[100],
                    },
                },
                outlinedSecondary: {
                    backgroundColor: colors.alpha.white[100],
                    "&:hover, &.MuiSelected": {
                        backgroundColor: colors.alpha.black[5],
                        color: colors.alpha.black[100],
                    },
                },
                sizeSmall: {
                    padding: "6px 16px",
                    lineHeight: 1.5,
                },
                sizeMedium: {
                    padding: "8px 20px",
                },
                sizeLarge: {
                    padding: "11px 24px",
                },
                textSizeSmall: {
                    padding: "7px 12px",
                },
                textSizeMedium: {
                    padding: "9px 16px",
                },
                textSizeLarge: {
                    padding: "12px 16px",
                },
            },
        },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: false,
            },
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
            },
        },
        MuiToggleButton: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {
                root: {
                    color: colors.primary.main,
                    background: colors.alpha.white[100],
                    transition: "all .2s",

                    "&:hover, &:active, &.active": {
                        color: colors.alpha.white[100],
                        background: colors.primary.main,
                    },
                    "&.Mui-selected, &.Mui-selected:hover": {
                        color: colors.alpha.white[100],
                        background: colors.primary.main,
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: 8,

                    "& .MuiTouchRipple-root": {
                        borderRadius: 8,
                    },
                },
                sizeSmall: {
                    padding: 4,
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    margin: 0,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    "& .MuiTouchRipple-root": {
                        opacity: 0.3,
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    background: colors.alpha.black[10],
                    border: 0,
                    height: 1,
                },
                vertical: {
                    height: "auto",
                    width: 1,

                    "&.MuiDivider-flexItem.MuiDivider-fullWidth": {
                        height: "auto",
                    },
                    "&.MuiDivider-absolute.MuiDivider-fullWidth": {
                        height: "100%",
                    },
                },
                withChildren: {
                    "&:before, &:after": {
                        border: 0,
                    },
                },
                wrapper: {
                    background: colors.alpha.white[100],
                    fontWeight: "bold",
                    height: 24,
                    lineHeight: "24px",
                    marginTop: -12,
                    color: "inherit",
                    textTransform: "uppercase",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    padding: 0,
                },
                elevation0: {
                    boxShadow: "none",
                },
                elevation: {
                    boxShadow: colors.shadows.card,
                },
                elevation2: {
                    boxShadow: colors.shadows.cardSm,
                },
                elevation24: {
                    boxShadow: colors.shadows.cardLg,
                },
                outlined: {
                    boxShadow: colors.shadows.card,
                },
            },
        },
        MuiLink: {
            defaultProps: {
                underline: "hover",
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    height: 6,
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    "& .MuiSlider-valueLabelCircle, .MuiSlider-valueLabelLabel": {
                        transform: "none",
                    },
                    "& .MuiSlider-valueLabel": {
                        borderRadius: 6,
                        background: colors.alpha.black[100],
                        color: colors.alpha.white[100],
                    },
                },
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    padding: 0,

                    "& .MuiListItem-button": {
                        // transition: "all .2s",

                        "& > .MuiSvgIcon-root": {
                            minWidth: 34,
                        },

                        "& .MuiTouchRipple-root": {
                            opacity: 0.2,
                        },
                    },
                    "& .MuiMenuItem-root.MuiButtonBase-root:hover, & .MuiMenuItem-root.MuiButtonBase-root:active":
                        {
                            color: colors.alpha.black[100],
                            background: alpha(colors.primary.lighter, 0.5),
                        },
                    "& .MuiListItem-root.MuiButtonBase-root.Mui-selected, & .MuiListItem-root.MuiButtonBase-root.Mui-selected:hover":
                        {
                            color: colors.alpha.black[100],
                            background: alpha(colors.primary.lighter, 1),
                        },
                    "& .MuiMenuItem-root.MuiButtonBase-root .MuiTouchRipple-root": {
                        opacity: 0.2,
                    },
                },
                padding: {
                    padding: "12px",
                    "& .MuiListItem-button": {
                        borderRadius: 6,
                        margin: "1px 0",
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    height: 38,
                    minHeight: 38,
                    overflow: "visible",
                },
                indicator: {
                    height: 38,
                    minHeight: 38,
                    borderRadius: 6,
                    border: "1px solid " + colors.primary.dark,
                    boxShadow: "0px 2px 10px " + colors.primary.light,
                },
                scrollableX: {
                    overflow: "visible !important",
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    padding: 0,
                    height: 38,
                    minHeight: 38,
                    borderRadius: 6,
                    transition: "color .2s",
                    textTransform: "capitalize",

                    "&.MuiButtonBase-root": {
                        minWidth: "auto",
                        paddingLeft: 20,
                        paddingRight: 20,
                        marginRight: 4,
                    },
                    "&:hover, &:active, &.active": {
                        color: colors.alpha.black[100],
                    },
                    "&.Mui-selected, &.Mui-selected:hover": {
                        color: colors.alpha.white[100],
                        zIndex: 5,
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    // padding: 12,
                },
                list: {
                    // padding: 12,

                    "& .MuiMenuItem-root.MuiButtonBase-root": {
                        fontSize: 14,
                        marginTop: 1,
                        marginBottom: 1,
                        // transition: "all .2s",
                        color: colors.alpha.black[70],

                        "& .MuiTouchRipple-root": {
                            opacity: 0.2,
                        },

                        "&:hover, &:active, &.active": {
                            color: colors.alpha.black[100],
                            background: alpha(colors.primary.lighter, 0.5),
                        },
                        "&.Mui-selected, &.Mui-selected:hover": {
                            color: colors.alpha.black[100],
                            background: alpha(colors.primary.lighter, 1),
                        },
                    },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    background: "transparent",
                    transition: "all .2s",

                    "&:hover, &:active, &.active": {
                        color: colors.alpha.black[100],
                        background: alpha(colors.primary.lighter, 0.5),
                    },
                    "&.Mui-selected, &.Mui-selected:hover": {
                        color: colors.alpha.black[100],
                        background: alpha(colors.primary.lighter, 1),
                    },
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    "&.MuiButtonBase-root": {
                        color: colors.secondary.main,

                        "&:hover, &:active, &.active": {
                            color: colors.alpha.black[100],
                            background: lighten(colors.primary.lighter, 0.5),
                        },
                        "&.Mui-selected, &.Mui-selected:hover": {
                            color: colors.alpha.black[100],
                            background: alpha(colors.primary.lighter, 1),
                        },
                    },
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                tag: {
                    margin: 1,
                },
                root: {
                    ".MuiAutocomplete-inputRoot.MuiOutlinedInput-root .MuiAutocomplete-endAdornment":
                        {
                            right: 14,
                        },
                },
                clearIndicator: {
                    background: colors.error.lighter,
                    color: colors.error.main,
                    marginRight: 8,

                    "&:hover": {
                        background: colors.error.lighter,
                        color: colors.error.dark,
                    },
                },
                popupIndicator: {
                    color: colors.alpha.black[50],

                    "&:hover": {
                        background: colors.primary.lighter,
                        color: colors.primary.main,
                    },
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                toolbar: {
                    "& .MuiIconButton-root": {
                        padding: 8,
                    },
                },
                select: {
                    "&:focus": {
                        backgroundColor: "transparent",
                    },
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: "0 !important",
                    padding: "0 !important",
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                head: {
                    background: colors.alpha.black[5],
                },
                root: {
                    transition: "background-color .2s",

                    "&.MuiTableRow-hover:hover": {
                        backgroundColor: colors.alpha.black[5],
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottomColor: colors.alpha.black[10],
                    fontSize: 14,
                },
                head: {
                    textTransform: "uppercase",
                    fontSize: 14,
                    fontWeight: "bold",
                    color: colors.alpha.black[90],
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                message: {
                    lineHeight: 1.5,
                    fontSize: 14,
                },
                standardInfo: {
                    color: colors.info.main,
                },
                action: {
                    color: colors.alpha.black[90],
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: alpha(colors.alpha.black["100"], 0.95),
                    padding: "8px 16px",
                    fontSize: 14,
                },
                arrow: {
                    color: alpha(colors.alpha.black["100"], 0.95),
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    height: 33,
                    overflow: "visible",

                    "& .MuiButtonBase-root": {
                        position: "absolute",
                        padding: 6,
                        transition:
                            "left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    },
                    "& .MuiIconButton-root": {
                        borderRadius: 100,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        opacity: 0.3,
                    },
                },
                thumb: {
                    border: "1px solid " + colors.alpha.black[30],
                    boxShadow:
                        "0px 9px 14px " +
                        colors.alpha.black[10] +
                        ", 0px 2px 2px " +
                        colors.alpha.black[10],
                },
                track: {
                    backgroundColor: colors.alpha.black[5],
                    border: "1px solid " + colors.alpha.black[10],
                    boxShadow: "inset 0px 1px 1px " + colors.alpha.black[10],
                    opacity: 1,
                },
                colorPrimary: {
                    "& .MuiSwitch-thumb": {
                        backgroundColor: colors.alpha.white[100],
                    },

                    "&.Mui-checked .MuiSwitch-thumb": {
                        backgroundColor: colors.primary.main,
                    },
                },
            },
        },
        MuiStepper: {
            styleOverrides: {
                root: {
                    paddingTop: 20,
                    paddingBottom: 20,
                    background: colors.alpha.black[5],
                },
            },
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    "&.MuiStepIcon-completed": {
                        color: colors.success.main,
                    },
                },
            },
        },
        MuiTypography: {
            defaultProps: {
                variantMapping: {
                    h1: "h1",
                    h2: "h2",
                    h3: "div",
                    h4: "div",
                    h5: "div",
                    h6: "div",
                    subtitle1: "div",
                    subtitle2: "div",
                    body1: "div",
                    body2: "div",
                },
            },
            styleOverrides: {
                gutterBottom: {
                    marginBottom: 4,
                },
                paragraph: {
                    fontSize: 17,
                    lineHeight: 1.7,
                },
            },
        },
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        h1: {
            fontWeight: 700,
            fontSize: 35,
            lineHeight: 1.5,
        },
        h2: {
            fontWeight: 700,
            fontSize: 30,
            lineHeight: 1.5,
        },
        h3: {
            fontWeight: 600,
            fontSize: 18,
            lineHeight: 1.5,
        },
        h4: {
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.5,
        },
        h5: {
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1.5,
        },
        h6: {
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1.3,
        },
        body1: {
            fontSize: 14,
            lineHeight: 1.3,
        },
        body2: {
            fontSize: 14,
            lineHeight: 1.3,
        },
        button: {
            fontSize: 14,
            lineHeight: 1.3,
            fontWeight: 600,
        },
        caption: {
            fontSize: 14,
            lineHeight: 1.3,
            textTransform: "none",
        },
        subtitle1: {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.3,
            opacity: 0.7,
            // filter: "brightness(2)",
        },
        subtitle2: {
            fontSize: 14,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.3,
            opacity: 0.7,
            // filter: "brightness(2)",
        },
        overline: {
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
        },
    },
    shadows: [
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
        "none",
    ],
});
