import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";

import { CssBaseline } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";

import App from "./App";
import AppEffects from "./components/AppEffects";
import ErrorFallback from "./components/ErrorFallback";
import { defaultSnackbarProviderProps } from "./constants/snackbar";
import store from "./redux/store";
import reportWebVitals from "./reportWebVitals";
import ThemeProvider from "./theme/ThemeProvider";

import "./index.css";

// Set document title based on VITE_BRAND_NAME_SHORT environment variable
const brandNameShort = import.meta.env["VITE_BRAND_NAME_SHORT"] || "ITMP";
document.title = brandNameShort;

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(
        <Provider store={store}>
            <BrowserRouter basename={"/"}>
                <StyledEngineProvider injectFirst={false}>
                    <ThemeProvider>
                        <CssBaseline />
                        <ErrorBoundary //
                            FallbackComponent={ErrorFallback}
                        >
                            <SnackbarProvider {...defaultSnackbarProviderProps}>
                                <AppEffects />
                                <App />
                            </SnackbarProvider>
                        </ErrorBoundary>
                    </ThemeProvider>
                </StyledEngineProvider>
            </BrowserRouter>
        </Provider>
    );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
if (import.meta.env["VITE_REACT_APP_ENV"] === "dev") {
    const onPerfEntry = (metric: unknown) => {
        // eslint-disable-next-line no-console
        console.log(metric); // Log the metric or send it to an analytics service
    };
    reportWebVitals(onPerfEntry);
}
