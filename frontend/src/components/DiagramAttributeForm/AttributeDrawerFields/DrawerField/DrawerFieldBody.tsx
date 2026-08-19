import React from "react";

import CircleIcon from "@mui/icons-material/Circle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    AccordionDetails,
    AccordionSummary,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";

import { StyledAccordion } from "#root/components/styled/Accordion";
import { getAttributeDrawerFieldName } from "#root/constants/attributeDrawerField";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

import DrawerFieldWrapper from "./DrawerFieldWrapper";
import DrawerFieldCheckbox from "./components/DrawerFieldCheckbox";
import DrawerFieldColorPicker from "./components/DrawerFieldColorPicker";
import DrawerFieldDefaultInput from "./components/DrawerFieldDefaultInput";
import DrawerFieldMultiInput from "./components/DrawerFieldMultiInput";
import DrawerFieldReactSelect from "./components/DrawerFieldReactSelect";
import DrawerFieldReactSelectCreatable from "./components/DrawerFieldReactSelectCreatable";
import DrawerFieldReactSelectMulti from "./components/DrawerFieldReactSelectMulti";
import DrawerFieldRefreshableInput from "./components/DrawerFieldRefreshableInput";
import DrawerFieldSelectIcon from "./components/DrawerFieldSelectIcon";

interface DrawerFieldBodyProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    refObject: Record<string, unknown>;
    editable: boolean;
    attribute: BaseFieldAttribute;
}

const DrawerFieldBodyComponent = ({
    sectionRef,
    refKey,
    attribute,
    editable,
    refObject,
}: DrawerFieldBodyProps) => {
    const fieldName = React.useMemo(
        () => getAttributeDrawerFieldName(refKey, attribute.key),
        [attribute.key, refKey]
    );
    const emptyValue = attribute.type == "text" ? "" : attribute?.type == "checkbox" ? false : [];
    const value = refObject?.[attribute?.key as keyof typeof refObject] || emptyValue;

    const attributeTypesNoTitle = [
        "checkbox", //
    ];

    const removeAttribute = React.useCallback(
        (key: string) => {
            const {
                drawerFieldsContext, //
            } = sectionRef.current;
            const {
                property,
                handleRemoveLocal, //
            } = drawerFieldsContext?.[refKey] || {};

            if (property && handleRemoveLocal) {
                handleRemoveLocal(
                    property, //
                    key
                );
            }
        },
        [refKey, sectionRef]
    );

    return (
        <DrawerFieldWrapper //
            attribute={attribute}
            disabled={!editable || !!attribute?.disabled}
            removeAttribute={removeAttribute}
            hideTitle={!!attributeTypesNoTitle?.includes(attribute?.type)}
        >
            {attribute?.type === "checkbox" && (
                <DrawerFieldCheckbox //
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={Boolean(value)}
                />
            )}
            {attribute?.type === "selectIcon" && (
                <DrawerFieldSelectIcon
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={`${value}`}
                />
            )}
            {attribute?.type === "color" && (
                <DrawerFieldColorPicker
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={`${value}`}
                />
            )}
            {attribute?.type === "select" && (
                <DrawerFieldReactSelect
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={`${value}`}
                />
            )}
            {attribute?.type === "selectcreatable" && (
                <DrawerFieldReactSelectCreatable
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={Array.isArray(value) ? (value as string[]) : []}
                />
            )}
            {attribute?.type === "selectmultiple" && (
                <DrawerFieldReactSelectMulti
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={Array.isArray(value) ? (value as string[]) : []}
                />
            )}
            {attribute?.type === "multiText" && (
                <DrawerFieldMultiInput
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={
                        typeof value === "object" && !Array.isArray(value) && !!value
                            ? (value as Record<string, unknown>)
                            : {}
                    }
                />
            )}
            {!!["text", "textIP", "number"]?.includes(attribute?.type) && (
                <DrawerFieldDefaultInput
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute} //
                    fieldName={fieldName}
                    value={attribute?.type === "number" ? Number(value) : `${value}`}
                />
            )}
            {attribute?.type === "refreshable_text" && (
                <DrawerFieldRefreshableInput
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute} //
                    fieldName={fieldName}
                    value={`${value}`}
                />
            )}
            {attribute?.type === "string_list" && (
                <StyledAccordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="diagram-attribute-form__nested-accordion-title">
                            {attribute?.key?.replaceAll("_", " ")?.trim()}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className="diagram-attribute-form__nested-accordion-details">
                        <Box>
                            <List
                                dense
                                className="diagram-attribute-form__nested-list"
                            >
                                {(value as string[])?.map((v, vIdx) => {
                                    return (
                                        <ListItem
                                            key={vIdx}
                                            className="diagram-attribute-form__nested-list-item"
                                        >
                                            <ListItemIcon className="diagram-attribute-form__nested-list-icon">
                                                <CircleIcon className="diagram-attribute-form__nested-list-dot" />
                                            </ListItemIcon>
                                            <ListItemText primary={v} />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </AccordionDetails>
                </StyledAccordion>
            )}
            {attribute?.type === "dict_list" && (
                <StyledAccordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="diagram-attribute-form__nested-accordion-title">
                            {attribute?.key?.replaceAll("_", " ")?.trim()}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className="diagram-attribute-form__nested-accordion-details">
                        <Box>
                            <List
                                dense
                                className="diagram-attribute-form__nested-list"
                            >
                                {(value as string[])?.map((v, vIdx) => {
                                    return (
                                        <ListItem
                                            key={vIdx}
                                            className="diagram-attribute-form__nested-list-item"
                                        >
                                            <ListItemIcon className="diagram-attribute-form__nested-list-icon">
                                                <CircleIcon className="diagram-attribute-form__nested-list-dot" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`${Object.values(v)[0]}`}
                                                secondary={`${Object.values(v)[1]}`}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </AccordionDetails>
                </StyledAccordion>
            )}
        </DrawerFieldWrapper>
    );
};

export default React.memo(DrawerFieldBodyComponent);
