import React from "react";

import { StyledMark } from "./styled";

interface ConstructorLineMarkProps {
    textString: string;
    highlight: boolean;
}

const ConstructorLineMarkComponent = ({ textString, highlight }: ConstructorLineMarkProps) => {
    return (
        <StyledMark
            className="px-05 m-0 py-0 font-medium" //
            highlight={highlight}
        >
            {textString}
        </StyledMark>
    );
};

export default React.memo(ConstructorLineMarkComponent);
