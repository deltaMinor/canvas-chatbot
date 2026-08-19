import React from "react";

import { useDefaultFieldButtonProps } from "#root/components/DialogField/dialogButtonProps";
import DialogFields from "#root/components/DialogFields";
import { dialogFieldStateKeys } from "#root/constants/diagramDrawerNode";
import { useProjectDiagram } from "#root/hooks/backendHooks";
import { useAddDrawerNodeAttribute, useAllNodes, useDiagramDraftNode } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DiagramElementAttrBaseFieldKey } from "#root/interfaces/diagramAttributes";
import { DialogFieldTypeEnum } from "#root/interfaces/dialogField";
import { NodeAttributeFactory } from "#root/lib/NodeAttributeFactory";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import {
    getAvailableAttributeOptions,
    getDefaultAttributeValue,
} from "#root/utils/diagram/diagramAttributeUtil";

const NodeDrawerDialogFieldsComponent = () => {
    const projectDiagram = useProjectDiagram();
    const allNodes = useAllNodes();
    const dialogFieldState = useDialogState();
    const draftNode = useDiagramDraftNode();
    const handleAddDrawerNodeAttribute = useAddDrawerNodeAttribute();

    const nodeAttributeFactory = React.useMemo(() => {
        if (!projectDiagram || !draftNode) {
            return null;
        }

        return new NodeAttributeFactory({
            draftNode,
            projectDiagram,
            allNodes,
        });
    }, [draftNode, projectDiagram, allNodes]);

    const node_data_attributes = React.useMemo(
        () => nodeAttributeFactory?.data ?? [],
        [nodeAttributeFactory]
    );
    const node_style_attributes = React.useMemo(
        () => nodeAttributeFactory?.style ?? [],
        [nodeAttributeFactory]
    );
    const node_cacti_attributes = React.useMemo(
        () => nodeAttributeFactory?.cacti ?? [],
        [nodeAttributeFactory]
    );

    const handleCloseDialogField = React.useCallback(() => {
        Object.values(dialogFieldStateKeys).forEach(async (key) => {
            await handleCloseDialogAsync(key);
        });
    }, []);

    const handleSetDataAttribute = React.useCallback(
        async (
            values: { [key: string]: unknown } //
        ) => {
            const attribute_key = `${values?.["attribute_key"] || ""}`;
            if (!attribute_key) return;

            // const attribute_type =
            //     node_data_attributes?.[attribute_key as keyof typeof node_data_attributes]?.type;

            const attribute_type = node_data_attributes?.find(
                (attr) => attr.key === attribute_key
            )?.type;

            handleAddDrawerNodeAttribute(
                DiagramElementAttrBaseFieldKey.data, //
                {
                    [attribute_key]: getDefaultAttributeValue(attribute_type),
                }
            );
        },
        [handleAddDrawerNodeAttribute, node_data_attributes]
    );

    const addDataButtonProps = useDefaultFieldButtonProps({
        handleCloseDialogField, //
        handleSave: handleSetDataAttribute,
    });

    const handleSetStyleAttribute = React.useCallback(
        async (
            values: { [key: string]: unknown } //
        ) => {
            const attribute_key = `${values?.["attribute_key"] || ""}`;
            if (!attribute_key) return;

            // const attribute_type =
            //     node_style_attributes?.[attribute_key as keyof typeof node_style_attributes]?.type;

            const attribute_type = node_style_attributes?.find(
                (attr) => attr.key === attribute_key
            )?.type;

            handleAddDrawerNodeAttribute(
                DiagramElementAttrBaseFieldKey.style, //
                {
                    [attribute_key]: getDefaultAttributeValue(attribute_type),
                }
            );
        },
        [handleAddDrawerNodeAttribute, node_style_attributes]
    );

    const addStyleButtonProps = useDefaultFieldButtonProps({
        handleCloseDialogField, //
        handleSave: handleSetStyleAttribute,
    });

    const nodeDataAttributeOptions = getAvailableAttributeOptions(
        node_data_attributes,
        draftNode?.data || {}
    );

    const nodeCactiAttributeOptions = getAvailableAttributeOptions(
        node_cacti_attributes,
        draftNode?.data || {}
    );

    const nodeStyleAttributeOptions = getAvailableAttributeOptions(
        node_style_attributes,
        (draftNode?.style as Record<string, unknown>) || {}
    );

    const dialogFieldProps = [
        {
            stateKey: dialogFieldStateKeys.addDataAttribute,
            message: "Please select new data attribute.",
            title: "Add New Data Attribute",
            buttonProps: addDataButtonProps,
            fields: [
                {
                    id: "attribute_key",
                    label: "Data Attribute",
                    type: DialogFieldTypeEnum.reactSelect,
                    required: true,
                    options: nodeDataAttributeOptions,
                },
            ],
        },
        {
            stateKey: dialogFieldStateKeys.addDataCactiAttribute,
            message: "Please select new data attribute.",
            title: "Add New Data (Cacti) Attribute",
            buttonProps: addDataButtonProps,
            fields: [
                {
                    id: "attribute_key",
                    label: "Data Attribute",
                    type: DialogFieldTypeEnum.reactSelect,
                    required: true,
                    options: nodeCactiAttributeOptions,
                },
            ],
        },
        {
            stateKey: dialogFieldStateKeys.addStyleAttribute,
            message: "Please select new style attribute.",
            title: "Add New Style Attribute",
            buttonProps: addStyleButtonProps,
            fields: [
                {
                    id: "attribute_key",
                    label: "Style Attribute",
                    type: DialogFieldTypeEnum.reactSelect,
                    required: true,
                    options: nodeStyleAttributeOptions,
                },
            ],
        },
    ];

    if (!projectDiagram || !draftNode || !nodeAttributeFactory) return null;

    return (
        <DialogFields
            dialogFieldProps={dialogFieldProps}
            dialogFieldState={dialogFieldState}
            handleCloseDialogField={handleCloseDialogField}
        />
    );
};

export default NodeDrawerDialogFieldsComponent;
