export const getClusterNodeStackParams = (stackPosition: string) => {
    switch (stackPosition) {
        case "top-left":
            return {
                direction: "row",
                alignItems: "flex-start",
                justifyContent: "flex-start",
            };
        case "top-center":
            return {
                direction: "column",
                alignItems: "center",
                justifyContent: "flex-start",
            };
        case "top-right":
            return {
                direction: "row-reverse",
                alignItems: "flex-start",
                justifyContent: "flex-start",
            };
        case "center-left":
            return {
                direction: "row",
                alignItems: "center",
                justifyContent: "flex-start",
            };
        case "center":
            return {
                direction: "column",
                alignItems: "center",
                justifyContent: "center",
            };
        case "center-right":
            return {
                direction: "row-reverse",
                alignItems: "center",
                justifyContent: "flex-start",
            };
        case "bottom-left":
            return {
                direction: "row",
                alignItems: "flex-end",
                justifyContent: "flex-start",
            };
        case "bottom-center":
            return {
                direction: "column-reverse",
                alignItems: "center",
                justifyContent: "flex-start",
            };
        case "bottom-right":
            return {
                direction: "row-reverse",
                alignItems: "flex-end",
                justifyContent: "flex-start",
            };
        default:
            return {
                direction: "row",
                alignItems: "flex-start",
                justifyContent: "flex-start",
            };
    }
};

export default getClusterNodeStackParams;
