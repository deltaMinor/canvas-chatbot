import React from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { ListItem } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";

import { StyledAddButton } from "./styled";

interface DrawerFieldsFooterItemProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    editable: boolean;
    disable_add?: boolean;
}

const DrawerFieldsFooterItemComponent = ({
    sectionRef,
    refKey,
    //
    editable,
    disable_add,
}: DrawerFieldsFooterItemProps) => {
    const isDisabled = !editable || !!disable_add;

    const handleClickAddAttribute = React.useCallback(() => {
        const {
            drawerFieldsContext, //
        } = sectionRef.current;
        const {
            attributeSetType,
            handleAddAttribute, //
        } = drawerFieldsContext?.[refKey] || {};

        if (!attributeSetType || !handleAddAttribute) return;
        handleAddAttribute(attributeSetType);
    }, [refKey, sectionRef]);

    if (!!isDisabled) return <></>;
    return (
        <ListItem //
            className="diagram-attribute-form__fields-item"
        >
            <MuiTooltip title="Add New Attribute">
                <div className="diagram-attribute-form__fill-width">
                    <StyledAddButton
                        disabled={!!isDisabled}
                        className="diagram-attribute-form__footer-add-button"
                        onClick={handleClickAddAttribute}
                        type="button"
                        startIcon={<AddRoundedIcon sx={{ fontSize: "0.95rem" }} />}
                    >
                        Add New Attribute
                    </StyledAddButton>
                </div>
            </MuiTooltip>
        </ListItem>
    );
};

export default React.memo(
    DrawerFieldsFooterItemComponent
) as typeof DrawerFieldsFooterItemComponent;
