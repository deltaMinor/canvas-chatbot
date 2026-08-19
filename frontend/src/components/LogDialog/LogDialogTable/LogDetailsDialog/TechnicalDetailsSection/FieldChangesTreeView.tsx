import React from "react";

import { Typography } from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import { useFieldChangesItems } from "#root/hooks/logDialog";

import FieldChangesTreeViewWrapper from "./FieldChangesTreeViewWrapper";

const FieldChangesTreeView = () => {
    const items = useFieldChangesItems();

    if (!items || items.length === 0) {
        return (
            <FieldChangesTreeViewWrapper>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        p: 1,
                        textAlign: "center",
                    }}
                    className="log-details-field-changes__empty"
                >
                    No field changes recorded
                </Typography>
            </FieldChangesTreeViewWrapper>
        );
    }

    return (
        <FieldChangesTreeViewWrapper>
            <>
                <RichTreeView items={items} />
            </>
        </FieldChangesTreeViewWrapper>
    );
};

export default React.memo(FieldChangesTreeView);
