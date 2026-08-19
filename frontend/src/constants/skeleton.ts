type SkeletonAnimationType = "pulse" | "wave" | false;
type SkeletonVariantType = "text" | "rectangular" | "rounded" | "circular";

export const default_skeleton_props = {
    width: "100%",
    height: "100%",
    sx: {
        minHeight: "200px",
    },
    variant: "rectangular" as SkeletonVariantType,
    animation: "wave" as SkeletonAnimationType,
};
