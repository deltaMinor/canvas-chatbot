import { lazy } from "react";

export const routes = [
    {
        path: "/",
        source: "./pages/Diagram",
    },
];

export const componentMap: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: React.LazyExoticComponent<React.FC<any>>;
} = {
    "./pages/Diagram": lazy(() => import("./pages/Diagram")),
};
