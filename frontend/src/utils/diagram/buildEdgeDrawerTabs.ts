import { CustomFieldGroup, TabConfig } from "#root/interfaces/diagramAttributes";

interface BuildEdgeDrawerTabsProps {
    allFieldGroups: CustomFieldGroup[];
}

export const buildEdgeDrawerTabs = ({ allFieldGroups }: BuildEdgeDrawerTabsProps): TabConfig[] => {
    const dataFieldGroups = allFieldGroups.filter((group) => group.tab_value === "data");
    const propertiesFieldGroups = allFieldGroups.filter(
        (group) => group.tab_value === "properties"
    );
    const styleFieldGroups = allFieldGroups.filter((group) => group.tab_value === "style");

    return [
        {
            tab_label: "Data",
            tab_index: 0,
            fieldGroups: dataFieldGroups,
            tab_value: "data",
        },
        {
            tab_label: "Properties",
            tab_index: 1,
            fieldGroups: propertiesFieldGroups,
            tab_value: "properties",
        },
        {
            tab_label: "Style",
            tab_index: 2,
            fieldGroups: styleFieldGroups,
            tab_value: "style",
        },
    ];
};
