import React from "react";
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from "react-select";

import { OptionLabel } from "#root/interfaces";
import { GroupLabel } from "#root/interfaces/reactSelect";

import { renderOptionLabelContent } from "../renderOptionLabelContent";
import { getDefaultStyles } from "../styles";

const DEFAULT_MIN_WIDTH = "100px";
const DEFAULT_MAX_WIDTH = "1200px";
const DEFAULT_MAX_MENU_HEIGHT = 250;

interface ReactSelectGroupedBaseProps {
    options: GroupLabel[];
    isMulti?: boolean;
    fullWidth?: boolean;
    isDisabled?: boolean;
    closeMenuOnSelect?: boolean;
    width?: string;
    maxMenuHeight?: number;
    maxWidth?: string;
    minWidth?: string;
    size?: "small" | "medium";
    hasOptionTags?: boolean;
}

interface ReactSelectGroupedSingleProps extends ReactSelectGroupedBaseProps {
    // isMulti?: false;
    value: SingleValue<OptionLabel>;
    handleChange: (a: SingleValue<OptionLabel>, b: ActionMeta<OptionLabel>) => void;
    styles?: StylesConfig<OptionLabel, false, GroupLabel>;
}

interface ReactSelectGroupedMultiProps extends ReactSelectGroupedBaseProps {
    // isMulti: true;
    value: MultiValue<OptionLabel>;
    handleChange: (a: MultiValue<OptionLabel>, b: ActionMeta<OptionLabel>) => void;
    styles?: StylesConfig<OptionLabel, true, GroupLabel>;
}

type ReactSelectGroupedProps = ReactSelectGroupedSingleProps | ReactSelectGroupedMultiProps;

const ReactSelectGroupedComponent = (props: ReactSelectGroupedProps) => {
    const {
        value,
        handleChange,
        styles,
        fullWidth = false,
        maxWidth = DEFAULT_MAX_WIDTH,
        minWidth = DEFAULT_MIN_WIDTH,
        maxMenuHeight = DEFAULT_MAX_MENU_HEIGHT,
        size = "medium",
        isMulti = false,
        hasOptionTags = false,
        ...restProps
    } = props;

    const [selectedValue, setSelectedValue] = React.useState<
        SingleValue<OptionLabel> | MultiValue<OptionLabel>
    >(value);

    const defaultStyles = getDefaultStyles(size);
    const _styles = { ...defaultStyles, ...styles };

    React.useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    if (isMulti) {
        const multiHandleChange = handleChange as (
            a: MultiValue<OptionLabel>,
            b: ActionMeta<OptionLabel>
        ) => void;
        const handleChangeMulti = (
            newValue: MultiValue<OptionLabel>,
            actionMeta: ActionMeta<OptionLabel>
        ) => {
            setSelectedValue(newValue);
            multiHandleChange(newValue, actionMeta);
        };

        return (
            <div
                style={{
                    minWidth: fullWidth ? "100%" : minWidth,
                    maxWidth: fullWidth ? "100%" : maxWidth,
                    width: fullWidth ? "100%" : undefined,
                }}
            >
                <Select<OptionLabel, true, GroupLabel>
                    isMulti
                    closeMenuOnSelect={!!isMulti ? false : true}
                    maxMenuHeight={maxMenuHeight}
                    menuPortalTarget={document.body}
                    menuShouldScrollIntoView={true}
                    onChange={handleChangeMulti}
                    styles={_styles}
                    formatOptionLabel={(option) => renderOptionLabelContent(option, hasOptionTags)}
                    value={selectedValue as MultiValue<OptionLabel>}
                    {...restProps}
                />
            </div>
        );
    }

    const singleHandleChange = handleChange as (
        a: SingleValue<OptionLabel>,
        b: ActionMeta<OptionLabel>
    ) => void;
    const handleChangeSingle = (
        newValue: SingleValue<OptionLabel>,
        actionMeta: ActionMeta<OptionLabel>
    ) => {
        setSelectedValue(newValue);
        singleHandleChange(newValue, actionMeta);
    };

    return (
        <div
            style={{
                minWidth: fullWidth ? "100%" : minWidth,
                maxWidth: fullWidth ? "100%" : maxWidth,
                width: fullWidth ? "100%" : undefined,
            }}
        >
            <Select<OptionLabel, false, GroupLabel>
                maxMenuHeight={maxMenuHeight}
                menuPortalTarget={document.body}
                menuShouldScrollIntoView
                onChange={handleChangeSingle}
                styles={_styles}
                formatOptionLabel={(option) => renderOptionLabelContent(option, hasOptionTags)}
                value={selectedValue as SingleValue<OptionLabel>}
                {...restProps}
            />
        </div>
    );
};

export default ReactSelectGroupedComponent;
