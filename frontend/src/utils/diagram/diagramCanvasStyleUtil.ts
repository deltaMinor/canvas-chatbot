export const getReactFlowSx = ({
    isAuthorizedToUpdate,
    isCanvasEditable,
}: {
    isAuthorizedToUpdate: boolean;
    isCanvasEditable: boolean;
}) => {
    if (!isCanvasEditable || !isAuthorizedToUpdate) {
        return {
            "& .react-flow__node": { pointerEvents: "none" },
            "& .react-flow__edge": { pointerEvents: "none" },
        };
    }

    return {
        "& .react-flow__edge.selected path:first-of-type": {
            strokeDasharray: 5,
            animation: "dashdraw 0.5s linear infinite",
            pointerEvents: "all",
        },
    };
};
