import React from "react";

import { Stack } from "@mui/material";

import DiagramEditToolbar from "./DiagramEditToolBar";
import DiagramHeaderWrapper from "./DiagramHeaderWrapper";

interface DiagramHeaderBodyProps {
    showEditToolbar: boolean;
}

const DiagramHeaderBodyComponent = ({
    showEditToolbar, //
}: DiagramHeaderBodyProps) => {
    return (
        <DiagramHeaderWrapper>
            <Stack
                direction="row" //
                justifyContent="space-between"
                alignItems="center"
                className="h-full w-full"
            >
                {!!showEditToolbar ? (
                    <Stack
                        direction="column"
                        style={{
                            height: "35px",
                            maxHeight: "35px",
                        }}
                        className="h-full w-full"
                        id="DiagramHeaderBody__Stack__Stack"
                    >
                        <DiagramEditToolbar />
                    </Stack>
                ) : (
                    <div></div>
                )}
                <Stack />
            </Stack>
        </DiagramHeaderWrapper>
    );
};

export default React.memo(DiagramHeaderBodyComponent);
