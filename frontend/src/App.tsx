import React from "react";

import Router from "./router";
import { routes } from "./routes";

const App = () => {
    return (
        <>
            <Router routes={routes} />
        </>
    );
};

export default React.memo(App);
