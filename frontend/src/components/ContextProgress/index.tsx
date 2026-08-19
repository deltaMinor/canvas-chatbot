import { LinearProgress } from "@mui/material";

import MuiSkeleton from "#root/components/MuiSkeleton";

interface ContextProgressProps {
    variant?: "linear" | "skeleton";
}

const ContextProgressComponent = ({ variant = "skeleton" }: ContextProgressProps) => {
    if (variant === "skeleton") {
        return <MuiSkeleton />;
    }
    return <LinearProgress />;
};

export default ContextProgressComponent;
