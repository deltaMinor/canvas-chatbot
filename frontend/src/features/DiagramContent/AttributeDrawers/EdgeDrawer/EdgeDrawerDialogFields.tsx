import React from "react";

import { useDefaultFieldButtonProps } from "#root/components/DialogField/dialogButtonProps";
import DialogFields from "#root/components/DialogFields";
import { dialogFieldStateKeys } from "#root/constants/diagramDrawerEdge";
import { useProjectDiagram } from "#root/hooks/backendHooks";
import {
    useAddDrawerEdgeAttribute,
    useAddDrawerEdgeMarker,
    useAllEdges,
    useDiagramDraftEdge,
} from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DiagramElementAttrBaseFieldKey } from "#root/interfaces/diagramAttributes";
import { DialogFieldTypeEnum } from "#root/interfaces/dialogField";
import { EdgeAttributeFactory } from "#root/lib/EdgeAttributeFactory";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import {
    getAvailableAttributeOptions,
    getDefaultAttributeValue,
} from "#root/utils/diagram/diagramAttributeUtil";

const EdgeDrawerDialogFieldsComponent = () => {
    const projectDiagram = useProjectDiagram();
    const allEdges = useAllEdges();
    const dialogFieldState = useDialogState();
    const draftEdge = useDiagramDraftEdge();
    const handleAddDrawerEdgeAttribute = useAddDrawerEdgeAttribute();
    const handleAddDrawerEdgeMarker = useAddDrawerEdgeMarker();

    const edgeAttributeFactory = React.useMemo(() => {
        if (!projectDiagram || !draftEdge) {
            return null;
        }

        return new EdgeAttributeFactory({
            draftEdge,
            projectDiagram,
            allEdges,
        });
    }, [draftEdge, projectDiagram, allEdges]);

    const edge_data_attributes = React.useMemo(
        () => edgeAttributeFactory?.data ?? [],
        [edgeAttributeFactory]
    );
    const edge_style_attributes = React.useMemo(
        () => edgeAttributeFactory?.style ?? [],
        [edgeAttributeFactory]
    );
    const edge_marker_attributes = React.useMemo(
        () => edgeAttributeFactory?.marker ?? [],
        [edgeAttributeFactory]
    );
    const edge_cacti_attributes = React.useMemo(
        () => edgeAttributeFactory?.cacti ?? [],
        [edgeAttributeFactory]
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
            //     edge_data_attributes?.[attribute_key as keyof typeof edge_data_attributes]?.type;

            const attribute_type = edge_data_attributes?.find(
                (attr) => attr.key === attribute_key
            )?.type;

            handleAddDrawerEdgeAttribute(
                DiagramElementAttrBaseFieldKey.data, //
                { [attribute_key]: getDefaultAttributeValue(attribute_type) }
            );
        },
        [edge_data_attributes, handleAddDrawerEdgeAttribute]
    );

    const addDataButtonProps = useDefaultFieldButtonProps({
        handleCloseDialogField, //
        handleSave: handleSetDataAttribute,
    });

    const handleSetMarkerEndAttribute = React.useCallback(
        async (
            values: { [key: string]: unknown } //
        ) => {
            const attribute_key = `${values?.["attribute_key"] || ""}`;
            if (!attribute_key) return;

            // const attribute_type =
            //     edge_marker_attributes?.[attribute_key as keyof typeof edge_marker_attributes]
            //         ?.type;

            const attribute_type = edge_marker_attributes?.find(
                (attr) => attr.key === attribute_key
            )?.type;

            handleAddDrawerEdgeMarker(
                DiagramElementAttrBaseFieldKey.markerEnd, //
                { [attribute_key]: getDefaultAttributeValue(attribute_type) }
            );
        },
        [edge_marker_attributes, handleAddDrawerEdgeMarker]
    );

    const addMarkerEndButtonProps = useDefaultFieldButtonProps({
        handleCloseDialogField, //
        handleSave: handleSetMarkerEndAttribute,
    });

    const handleSetMarkerStartAttribute = React.useCallback(
        async (
            values: { [key: string]: unknown } //
        ) => {
            const attribute_key = `${values?.["attribute_key"] || ""}`;
            if (!attribute_key) return;

            // const attribute_type =
            //     edge_marker_attributes?.[attribute_key as keyof typeof edge_marker_attributes]
            //         ?.type;

            const attribute_type = edge_marker_attributes?.find(
                (attr) => attr.key === attribute_key
            )?.type;

            handleAddDrawerEdgeMarker(
                DiagramElementAttrBaseFieldKey.markerStart, //
                { [attribute_key]: getDefaultAttributeValue(attribute_type) }
            );
        },
        [edge_marker_attributes, handleAddDrawerEdgeMarker]
    );

    const addMarkerStartButtonProps = useDefaultFieldButtonProps({
        handleCloseDialogField, //
        handleSave: handleSetMarkerStartAttribute,
    });

    const handleSetStyleAttribute = React.useCallback(
        async (
            values: { [key: string]: unknown } //
        ) => {
            const attribute_key = `${values?.["attribute_key"] || ""}`;
            if (!attribute_key) return;

            // const attribute_type =
            //     edge_style_attributes?.[attribute_key as keyof typeof edge_style_attributes]?.type;

            const attribute_type = edge_style_attributes?.find(
                (attr) => attr.key === attribute_key
            )?.type;

            handleAddDrawerEdgeAttribute(
                DiagramElementAttrBaseFieldKey.style, //
                { [attribute_key]: getDefaultAttributeValue(attribute_type) }
            );
        },
        [edge_style_attributes, handleAddDrawerEdgeAttribute]
    );

    const addStyleButtonProps = useDefaultFieldButtonProps({
        handleCloseDialogField, //
        handleSave: handleSetStyleAttribute,
    });

    const edgeDataAttributeOptions = getAvailableAttributeOptions(
        edge_data_attributes,
        draftEdge?.data || {}
    );

    const edgeDataCactiAttributeOptions = getAvailableAttributeOptions(
        edge_cacti_attributes,
        draftEdge?.data || {}
    );

    const edgeStyleAttributeOptions = getAvailableAttributeOptions(
        edge_style_attributes,
        (draftEdge?.style as Record<string, unknown>) || {}
    );

    const edgeMarkerStartAttributeOptions = getAvailableAttributeOptions(
        edge_marker_attributes,
        (draftEdge?.markerStart as Record<string, unknown>) || {}
    );

    const edgeMarkerEndAttributeOptions = getAvailableAttributeOptions(
        edge_marker_attributes,
        (draftEdge?.markerEnd as Record<string, unknown>) || {}
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
                    options: edgeDataAttributeOptions,
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
                    options: edgeDataCactiAttributeOptions,
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
                    options: edgeStyleAttributeOptions,
                },
            ],
        },
        {
            stateKey: dialogFieldStateKeys.addMarkerEndAttribute,
            message: "Please select new marker end attribute.",
            title: "Add New Marker End Attribute",
            buttonProps: addMarkerEndButtonProps,
            fields: [
                {
                    id: "attribute_key",
                    label: "Marker End Attribute",
                    type: DialogFieldTypeEnum.reactSelect,
                    required: true,
                    options: edgeMarkerEndAttributeOptions,
                },
            ],
        },
        {
            stateKey: dialogFieldStateKeys.addMarkerStartAttribute,
            message: "Please select new marker start attribute.",
            title: "Add New Marker Start Attribute",
            buttonProps: addMarkerStartButtonProps,
            fields: [
                {
                    id: "attribute_key",
                    label: "Marker Start Attribute",
                    type: DialogFieldTypeEnum.reactSelect,
                    required: true,
                    options: edgeMarkerStartAttributeOptions,
                },
            ],
        },
    ];

    if (!projectDiagram || !draftEdge || !edgeAttributeFactory) return null;

    return (
        <DialogFields
            dialogFieldProps={dialogFieldProps}
            dialogFieldState={dialogFieldState}
            handleCloseDialogField={handleCloseDialogField}
        />
    );
};

export default EdgeDrawerDialogFieldsComponent;
