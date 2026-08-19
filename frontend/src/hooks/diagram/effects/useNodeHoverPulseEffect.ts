import React from "react";

interface UseNodeHoverPulseEffectParams {
    isHovered: boolean;
    setHandlePulseToken: React.Dispatch<React.SetStateAction<number>>;
}

export const useNodeHoverPulseEffect = ({
    isHovered,
    setHandlePulseToken,
}: UseNodeHoverPulseEffectParams) => {
    React.useEffect(() => {
        if (!isHovered) return;

        setHandlePulseToken((value) => value + 1);
    }, [isHovered, setHandlePulseToken]);
};

export default useNodeHoverPulseEffect;
