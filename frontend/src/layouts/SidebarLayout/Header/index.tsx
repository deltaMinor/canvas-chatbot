import React from "react";

import { useActiveNavKeyEffect } from "#root/hooks/layoutHooks";

import HeaderBody from "./HeaderBody";

const HeaderComponent = () => {
    useActiveNavKeyEffect();

    return <HeaderBody />;
};

export default React.memo(HeaderComponent);
