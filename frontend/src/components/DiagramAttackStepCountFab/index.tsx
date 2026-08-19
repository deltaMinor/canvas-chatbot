import React from "react";

import { Fab, Typography } from "@mui/material";
import { Property } from "csstype";

import { getAvatarBackgroundColor } from "./helper";
import "./style.scss";

interface DiagramAttackStepCountFabProps {
    handleClick: () => Promise<void>;
    id: string;
    style?: React.CSSProperties;
    targetNodeId: string;
    stepCount: number;
}

const DiagramAttackStepCountFabComponent = ({
    handleClick,
    id,
    style: props__style,
    targetNodeId,
    stepCount,
}: DiagramAttackStepCountFabProps) => {
    const selected = targetNodeId === id;
    const displayValue = stepCount > 99 ? "99+" : String(stepCount);

    const backgroundColor = React.useMemo(() => getAvatarBackgroundColor(stepCount), [stepCount]);

    return (
        <Fab //
            onClick={handleClick}
            className={`${selected ? "boxSelected" : ""}`}
            style={{
                borderRadius: "999px",
                position: "absolute" as Property.Position,
                backgroundColor,
                width: "34px",
                height: "34px",
                minHeight: "34px",
                ...props__style,
            }}
            sx={{
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.92)",
                boxShadow: selected
                    ? "0 0 0 4px rgba(123, 31, 162, 0.16), 0 10px 22px rgba(15, 23, 42, 0.2)"
                    : "0 8px 18px rgba(15, 23, 42, 0.16)",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                "&:hover": {
                    transform: "translateY(-1px) scale(1.03)",
                },
            }}
        >
            <Typography
                sx={{
                    lineHeight: 1, //
                    fontWeight: 800,
                    fontSize: "0.82rem",
                }}
            >
                {displayValue}
            </Typography>
        </Fab>
    );
};

export default React.memo(DiagramAttackStepCountFabComponent);
