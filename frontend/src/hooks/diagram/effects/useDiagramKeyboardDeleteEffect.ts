import React from "react";

import { useKeyPress } from "@xyflow/react";

import { useHandleDeleteSelectedItems } from "#root/hooks/diagram";

export const useDiagramKeyboardDeleteEffect = () => {
    const { handleDeleteSelectedItems } = useHandleDeleteSelectedItems();
    const deletePressed = useKeyPress("Delete");

    React.useEffect(() => {
        if (!deletePressed) return;
        handleDeleteSelectedItems();
    }, [deletePressed, handleDeleteSelectedItems]);
};
