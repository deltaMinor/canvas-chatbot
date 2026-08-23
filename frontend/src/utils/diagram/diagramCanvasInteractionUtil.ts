export const initResizeObserver = () => {
    window.addEventListener("error", (event) => {
        if (event.message === "ResizeObserver loop limit exceeded") {
            const resizeObserverErrDiv = document.getElementById(
                "webpack-dev-server-client-overlay-div"
            );
            const resizeObserverErr = document.getElementById("webpack-dev-server-client-overlay");
            if (resizeObserverErr) {
                resizeObserverErr.setAttribute("style", "display: none");
            }
            if (resizeObserverErrDiv) {
                resizeObserverErrDiv.setAttribute("style", "display: none");
            }
        }
    });
};
