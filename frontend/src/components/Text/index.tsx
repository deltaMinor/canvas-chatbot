import { clsx } from "clsx";
import PropTypes from "prop-types";

import { TextWrapper } from "./styled";

interface TextProps {
    className?: string;
    color?: "primary" | "secondary" | "error" | "warning" | "success" | "info" | "black";
    flex?: boolean;
    children?: React.ReactNode;
}

const Text = ({
    // className,
    color = "secondary",
    flex,
    children,
    ...rest
}: TextProps) => {
    return (
        <TextWrapper
            className={clsx("MuiText-" + color, { flexItem: flex })}
            {...rest}
        >
            {children}
        </TextWrapper>
    );
};

Text.propTypes = {
    // children: PropTypes.node,
    className: PropTypes.string,
    color: PropTypes.oneOf([
        "primary", //
        "secondary",
        "error",
        "warning",
        "success",
        "info",
        "black",
    ]),
};

export default Text;
