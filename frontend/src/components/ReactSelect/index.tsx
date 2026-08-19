import Select, {
    ActionMeta,
    GroupBase,
    OnChangeValue,
    OptionsOrGroups,
    Props,
    PropsValue,
} from "react-select";

import { OptionLabel } from "#root/interfaces";

import { renderOptionLabelContent } from "./renderOptionLabelContent";
import { getDefaultStyles } from "./styles";

const DEFAULT_MIN_WIDTH = "100px";
const DEFAULT_MAX_WIDTH = "1200px";
const DEFAULT_MAX_MENU_HEIGHT = 250;

interface ReactSelectBaseProps<
    Option = OptionLabel, //
    IsMulti extends boolean = false,
> extends Props<Option, IsMulti> {}

interface ReactSelectProps<
    Option extends OptionLabel = OptionLabel, //
    IsMulti extends boolean = false,
> extends ReactSelectBaseProps<Option, IsMulti> {
    value?: PropsValue<Option>;
    handleChange: (
        newValue: OnChangeValue<Option, IsMulti>, //
        actionMeta: ActionMeta<Option>
    ) => void;
    fullWidth?: boolean;
    maxWidth?: string;
    minWidth?: string;
    options: OptionsOrGroups<Option, GroupBase<Option>>;
    controlled?: boolean;
    hasOptionTags?: boolean;
    size?: "small" | "medium";
}

const ReactSelectComponent = <
    Option extends OptionLabel, //
    IsMulti extends boolean,
>({
    handleChange,
    value,
    fullWidth = false,
    maxWidth = DEFAULT_MAX_WIDTH,
    minWidth = DEFAULT_MIN_WIDTH,
    // controlled = false,
    hideSelectedOptions = false,
    isMulti = false as IsMulti,
    maxMenuHeight = DEFAULT_MAX_MENU_HEIGHT,
    menuPlacement = "auto",
    menuPortalTarget = document.body,
    menuShouldScrollIntoView = true,
    size = "medium",
    styles = {},
    hasOptionTags = false,
    ...props
}: ReactSelectProps<Option, IsMulti>) => {
    const handleChangeSelect = (
        newValue: OnChangeValue<Option, IsMulti>, //
        actionMeta: ActionMeta<Option>
    ) => {
        handleChange(newValue, actionMeta);
    };

    const defaultStyles = getDefaultStyles(size);

    return (
        <div
            style={{
                minWidth: fullWidth ? "100%" : minWidth,
                maxWidth: fullWidth ? "100%" : maxWidth,
                width: fullWidth ? "100%" : undefined,
            }}
        >
            <Select<Option, IsMulti>
                id="custom-react-select"
                closeMenuOnSelect={!!isMulti ? false : true}
                hideSelectedOptions={hideSelectedOptions}
                isMulti={isMulti as IsMulti}
                maxMenuHeight={maxMenuHeight}
                menuPlacement={menuPlacement}
                menuPortalTarget={menuPortalTarget}
                menuShouldScrollIntoView={menuShouldScrollIntoView}
                onChange={handleChangeSelect}
                styles={{ ...defaultStyles, ...styles }}
                formatOptionLabel={(option, meta) =>
                    renderOptionLabelContent(option, hasOptionTags && meta.context === "menu")
                }
                value={value ?? (isMulti ? [] : null)}
                {...props}
            />
        </div>
    );
};

export default ReactSelectComponent;
