import React from "react";

import { Box } from "@mui/material";

import AttributeDrawer from "#root/components/DiagramAttributeForm";
import { dialogConfirmStateKeys, initEdgeAttributes } from "#root/constants/diagramDrawerEdge";
import {
    useAddEdgeAttribute,
    useDiagramDraftEdge,
    useDiagramDraftEdgeAttributes,
    useIsEdgeEditable,
    useRemoveAttrDrawerEdge,
    useSaveDrawerEdge,
    useSetDiagramEdgeDrawerDirty,
} from "#root/hooks/diagram";
import { DiagramEdge } from "#root/interfaces/diagram";
import {
    CustomFieldConfig,
    CustomFieldGroup,
    DiagramElementAttrBaseFieldKey,
    HandleAddAttribute,
    HandleRemoveLocal,
    TabConfig,
} from "#root/interfaces/diagramAttributes";
import { buildEdgeDrawerTabs } from "#root/utils/diagram/buildEdgeDrawerTabs";
import { submitAttributeDrawerDraft } from "#root/utils/diagram/diagramAttributeDrawerSubmitUtil";
import { buildDefaultEdgeFieldGroups } from "#root/utils/diagram/diagramDrawerEdgeUtil";

import EdgeDrawerDialogs from "./EdgeDrawerDialogs";
import EdgeDrawerTabContent from "./EdgeDrawerTabContent";

interface EdgeDrawerBodyProps {
    onCancel: () => Promise<void>;
}

const EdgeDrawerBodyComponent = ({ onCancel }: EdgeDrawerBodyProps) => {
    const draftEdge = useDiagramDraftEdge();
    const draftEdgeAttributes = useDiagramDraftEdgeAttributes();
    const isEdgeEditable = useIsEdgeEditable();
    const handleAddEdgeAttribute: HandleAddAttribute = useAddEdgeAttribute();
    const handleRemoveAttrDrawerEdge: HandleRemoveLocal = useRemoveAttrDrawerEdge();
    const handleSaveDrawerEdge = useSaveDrawerEdge();
    const setDiagramEdgeDrawerDirty = useSetDiagramEdgeDrawerDirty();

    const customFieldGroups = React.useMemo((): CustomFieldGroup[] => {
        const groups: CustomFieldGroup[] = [];
        if (!draftEdge || !draftEdgeAttributes) return groups;

        if (!!draftEdge?.data?.["bidirectional"] && draftEdgeAttributes?.["markerStart"]) {
            groups.push({
                title: "Marker Start",
                tab_value: "style",
                default_expanded: true,
                fields: [
                    {
                        attributes: draftEdgeAttributes["markerStart"],
                        attributeSetType: "markerStart" as const,
                        property: DiagramElementAttrBaseFieldKey.markerStart,
                        refKey: "markerStart",
                        refObject: (draftEdge?.markerStart as { [key: string]: unknown }) || {},
                    },
                ],
            });
        }

        if (draftEdgeAttributes?.["markerEnd"]) {
            groups.push({
                title: "Marker End",
                tab_value: "style",
                default_expanded: true,
                fields: [
                    {
                        attributes: draftEdgeAttributes["markerEnd"],
                        attributeSetType: "markerEnd" as const,
                        property: DiagramElementAttrBaseFieldKey.markerEnd,
                        refKey: "markerEnd",
                        refObject: (draftEdge?.markerEnd as { [key: string]: unknown }) || {},
                    },
                ],
            });
        }

        return groups;
    }, [draftEdge, draftEdgeAttributes]);

    const tabs = React.useMemo((): TabConfig[] => {
        if (!draftEdgeAttributes || !draftEdge) {
            return buildEdgeDrawerTabs({ allFieldGroups: [] });
        }

        const defaultFieldGroups = buildDefaultEdgeFieldGroups({
            diagram_attributes: draftEdgeAttributes ?? initEdgeAttributes,
            diagram_data: draftEdge,
            editable: !!isEdgeEditable,
            draftEdge: draftEdge,
            handleAddAttribute: handleAddEdgeAttribute,
            handleRemoveLocal: handleRemoveAttrDrawerEdge,
            handleRenewAttribute: async (): Promise<void> => {},
        });
        const allFieldGroups = [...defaultFieldGroups, ...customFieldGroups];
        return buildEdgeDrawerTabs({
            allFieldGroups,
        });
    }, [
        customFieldGroups,
        draftEdge,
        draftEdgeAttributes,
        handleAddEdgeAttribute,
        handleRemoveAttrDrawerEdge,
        isEdgeEditable,
    ]);

    const tabLabels = React.useMemo(() => tabs.map((tab: TabConfig) => tab.tab_label), [tabs]);
    const defaultValues = React.useMemo((): Record<string, unknown> => {
        const nextDefaultValues: Record<string, unknown> = {};

        tabs.forEach((tab: TabConfig) => {
            tab.fieldGroups.forEach((group: CustomFieldGroup) => {
                group.fields.forEach((field: CustomFieldConfig) => {
                    nextDefaultValues[field.refKey] = field.refObject ?? {};
                });
            });
        });

        return nextDefaultValues;
    }, [tabs]);

    const handleSubmit = React.useCallback(
        async (values: Record<string, unknown>) => {
            await submitAttributeDrawerDraft<DiagramEdge>({
                values,
                tabs,
                draft: draftEdge,
                saveDraft: handleSaveDrawerEdge,
                debugKey: "EdgeDrawerBody",
                debugData: {
                    tabLabels,
                },
            });
        },
        [draftEdge, handleSaveDrawerEdge, tabLabels, tabs]
    );

    return (
        <AttributeDrawer.Root
            defaultValues={defaultValues}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            closeConfirmStateKey={dialogConfirmStateKeys.closeDrawerEdge}
            onDirtyStateChange={setDiagramEdgeDrawerDirty}
        >
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <AttributeDrawer.Tabs tabLabels={tabLabels} />
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        px: 2,
                        pb: 1.5,
                        pt: 1.25,
                    }}
                >
                    <AttributeDrawer.TabContentWrapper>
                        {tabs.map((tab, index) => (
                            <AttributeDrawer.TabPanel
                                key={index}
                                index={index}
                            >
                                <EdgeDrawerTabContent
                                    groups={tab.fieldGroups}
                                    editable={!!isEdgeEditable}
                                    handleAddAttribute={handleAddEdgeAttribute}
                                    handleRemoveLocal={handleRemoveAttrDrawerEdge}
                                    handleRenewAttribute={async (): Promise<void> => {}}
                                />
                            </AttributeDrawer.TabPanel>
                        ))}
                    </AttributeDrawer.TabContentWrapper>
                </Box>
            </Box>
            <AttributeDrawer.Footer editable={!!isEdgeEditable} />
            <EdgeDrawerDialogs />
        </AttributeDrawer.Root>
    );
};

export default React.memo(EdgeDrawerBodyComponent);
