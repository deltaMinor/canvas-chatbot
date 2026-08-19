import React from "react";

import { StyledMark } from "./styled";

interface ConstructorLineMarkProps {
    textString: string;
    highlight: boolean;
}

const ConstructorLineMarkComponent: React.FC<ConstructorLineMarkProps> = ({
    textString,
    highlight,
}) => {
    return <StyledMark highlight={highlight}>{textString}</StyledMark>;
};

export default React.memo(ConstructorLineMarkComponent);
