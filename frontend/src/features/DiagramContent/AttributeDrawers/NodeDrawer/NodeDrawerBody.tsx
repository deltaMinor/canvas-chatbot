import React from "react";

import { Box } from "@mui/material";

import AttributeDrawer from "#root/components/DiagramAttributeForm";
import { dialogConfirmStateKeys, initNodeAttributes } from "#root/constants/diagramDrawerNode";
import {
    useAddNodeAttribute,
    useDiagramDraftNode,
    useDiagramDraftNodeAttributes,
    useIsNodeEditable,
    useRemoveAttrDrawerNode,
    useRenewNodeAttribute,
    useSaveDrawerNode,
    useSetDiagramNodeDrawerDirty,
} from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";
import {
    CustomFieldConfig,
    CustomFieldGroup,
    HandleAddAttribute,
    HandleRemoveLocal,
    HandleRenewAttribute,
    TabConfig,
} from "#root/interfaces/diagramAttributes";
import { buildNodeDrawerTabs } from "#root/utils/diagram/buildNodeDrawerTabs";
import { submitAttributeDrawerDraft } from "#root/utils/diagram/diagramAttributeDrawerSubmitUtil";
import { buildDefaultNodeFieldGroups } from "#root/utils/diagram/diagramDrawerNodeUtil";

import NodeDrawerDialogs from "./NodeDrawerDialogs";
import NodeDrawerTabContent from "./NodeDrawerTabContent";

interface NodeDrawerBodyProps {
    onCancel: () => Promise<void>;
}

const NodeDrawerBodyComponent = ({ onCancel }: NodeDrawerBodyProps) => {
    const draftNode = useDiagramDraftNode();
    const draftNodeAttributes = useDiagramDraftNodeAttributes();
    const isNodeEditable = useIsNodeEditable();
    const handleAddNodeAttribute: HandleAddAttribute = useAddNodeAttribute();
    const handleRemoveAttrDrawerNode: HandleRemoveLocal = useRemoveAttrDrawerNode();
    const handleRenewAttribute: HandleRenewAttribute = useRenewNodeAttribute();
    const handleSaveDrawerNode = useSaveDrawerNode();
    const setDiagramNodeDrawerDirty = useSetDiagramNodeDrawerDirty();

    const customFieldGroups = React.useMemo((): CustomFieldGroup[] => {
        const groups: CustomFieldGroup[] = [];

        // Add more field groups here as needed, each with its own condition

        return groups;
    }, []);

    const tabs = React.useMemo((): TabConfig[] => {
        if (!draftNodeAttributes || !draftNode) {
            return buildNodeDrawerTabs({ allFieldGroups: [] });
        }

        const defaultFieldGroups = buildDefaultNodeFieldGroups({
            diagram_attributes: draftNodeAttributes ?? initNodeAttributes,
            diagram_data: draftNode,
            editable: !!isNodeEditable,
            draftNode: draftNode,
            handleAddAttribute: handleAddNodeAttribute,
            handleRemoveLocal: handleRemoveAttrDrawerNode,
            handleRenewAttribute: handleRenewAttribute,
        });
        const allFieldGroups = [...defaultFieldGroups, ...customFieldGroups];
        return buildNodeDrawerTabs({
            allFieldGroups,
        });
    }, [
        customFieldGroups,
        draftNode,
        draftNodeAttributes,
        handleAddNodeAttribute,
        handleRemoveAttrDrawerNode,
        handleRenewAttribute,
        isNodeEditable,
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
            await submitAttributeDrawerDraft<DiagramNode>({
                values,
                tabs,
                draft: draftNode,
                saveDraft: handleSaveDrawerNode,
                debugKey: "NodeDrawerBody",
                debugData: {
                    tabLabels,
                },
            });
        },
        [draftNode, handleSaveDrawerNode, tabLabels, tabs]
    );

    return (
        <AttributeDrawer.Root
            defaultValues={defaultValues}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            closeConfirmStateKey={dialogConfirmStateKeys.closeDrawerNode}
            onDirtyStateChange={setDiagramNodeDrawerDirty}
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
                <AttributeDrawer.TabContentWrapper>
                    {tabs.map((tab, index) => (
                        <AttributeDrawer.TabPanel
                            key={index}
                            index={index}
                        >
                            <NodeDrawerTabContent
                                groups={tab.fieldGroups}
                                editable={!!isNodeEditable}
                                handleAddAttribute={handleAddNodeAttribute}
                                handleRemoveLocal={handleRemoveAttrDrawerNode}
                                handleRenewAttribute={handleRenewAttribute}
                            />
                        </AttributeDrawer.TabPanel>
                    ))}
                </AttributeDrawer.TabContentWrapper>
            </Box>
            <AttributeDrawer.Footer editable={!!isNodeEditable} />
            <NodeDrawerDialogs />
        </AttributeDrawer.Root>
    );
};

export default React.memo(NodeDrawerBodyComponent);
