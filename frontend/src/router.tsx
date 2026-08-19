import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { RouteProps } from "#root/interfaces/router";

import AppLayout from "./AppLayout";
import Loader from "./components/Loader";
import { componentMap } from "./routes";

interface RouterComponentProps {
    routes: RouteProps[];
}

const RouterComponent = ({
    routes, //
}: RouterComponentProps) => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                {routes.map((r) => {
                    const ComponentFromMap = componentMap[`${r.source}`];
                    const Component = ComponentFromMap
                        ? Loader(ComponentFromMap)
                        : () => <div>Component not found</div>;
                    return (
                        <Route
                            key={r.path} //
                            path={r.path}
                            element={<Component />}
                        />
                    );
                })}
                <Route
                    path="*"
                    element={<Navigate to="/" />}
                />
            </Route>
        </Routes>
    );
};

export default React.memo(RouterComponent);
