import React, { KeyboardEventHandler } from "react";
import {
    ActionMeta,
    GroupBase,
    InputActionMeta,
    MultiValue,
    OnChangeValue,
    OptionsOrGroups,
    PropsValue,
    SingleValue,
} from "react-select";
import CreatableSelect, { CreatableProps } from "react-select/creatable";

import { OptionLabel } from "#root/interfaces";

import { getDefaultStyles } from "./styles";

const DEFAULT_MIN_WIDTH = "100px";
const DEFAULT_MAX_WIDTH = "1200px";
const DEFAULT_MAX_MENU_HEIGHT = 250;

const getSortedOptions = <
    Option extends OptionLabel, //
    Group extends GroupBase<Option> = GroupBase<Option>,
>(
    options: OptionsOrGroups<Option, Group> //
) => {
    if (!Array.isArray(options)) return options;
    return options?.sort((a: Option, b: Option) =>
        String(a.label ?? "").localeCompare(String(b.label ?? ""))
    );
};

const createOption = (label: string) => {
    return {
        label,
        value: label || "",
    };
};

type CreateableSelectValueType<Option, IsMulti extends boolean> = IsMulti extends true
    ? MultiValue<Option>
    : SingleValue<Option>;

type CreateableSelectProps<
    Option, //
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
> = CreatableProps<Option, IsMulti, Group>;

interface ReactSelectCreatableProps<
    Option, //
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
> extends CreateableSelectProps<Option, IsMulti, Group> {
    handleChange?: (
        newValue: CreateableSelectValueType<Option, IsMulti>, //
        actionMeta?: ActionMeta<Option>
    ) => void;
    handleCreate?: (newValue: string) => void;
    maxWidth?: string;
    minWidth?: string;
    size?: "small" | "medium";
}

const ReactSelectCreatableComponent = <
    Option extends OptionLabel,
    IsMulti extends boolean,
    Group extends GroupBase<Option> = GroupBase<Option>,
>({
    handleChange = () => {},
    handleCreate = () => {},
    minWidth,
    maxWidth,
    options,
    isMulti,
    hideSelectedOptions = true,
    maxMenuHeight = DEFAULT_MAX_MENU_HEIGHT,
    menuPlacement = "auto",
    menuPortalTarget = document.body,
    menuShouldScrollIntoView = true,
    size = "medium",
    styles = {},
    value,
    ...props
}: ReactSelectCreatableProps<Option, IsMulti, Group>) => {
    const [inputValue, setInputValue] = React.useState("");
    const valueRef = React.useRef<PropsValue<Option>>(value ?? null);

    const checkIfExistingValueExist = (newValue: string) => {
        if (!isMulti) return false;
        return !!(value as MultiValue<OptionLabel>)?.find((v) => v.value === newValue);
    };

    const handleKeyDown: KeyboardEventHandler = (
        event: React.KeyboardEvent<HTMLDivElement> //
    ) => {
        if (!inputValue) return;
        switch (event.key) {
            case "Enter":
            case "Tab": {
                const _value = createOption(inputValue);
                const duplicateExist = checkIfExistingValueExist(_value.value);
                if (!!duplicateExist) {
                    setInputValue("");
                    return;
                }
                if (!!isMulti) {
                    const _newValue = [
                        ...(valueRef.current as MultiValue<Option>), //
                        _value,
                    ] as unknown as CreateableSelectValueType<Option, IsMulti>;
                    handleChange(_newValue);
                    valueRef.current = _newValue;
                } else {
                    const _newValue = {
                        ..._value, //
                    } as CreateableSelectValueType<Option, IsMulti>;
                    handleChange(_newValue);
                    valueRef.current = _newValue;
                }
                setInputValue("");
                event.preventDefault();
                break;
            }
        }
    };

    const handleInputChange = (newValue: string, _actionMeta: InputActionMeta) => {
        setInputValue(newValue);
    };

    const handleChangeCreatableSelect = (
        newValue: OnChangeValue<Option, IsMulti>, //
        actionMeta: ActionMeta<Option>
    ) => {
        switch (actionMeta.action) {
            case "remove-value":
            case "pop-value":
                if (actionMeta.removedValue.isFixed) {
                    return;
                }
                break;
            case "clear":
                if (!!Array.isArray(value)) {
                    newValue = value?.filter((v) => !!v.isFixed) as unknown as OnChangeValue<
                        Option,
                        IsMulti
                    >;
                }
                break;
        }
        handleChange(newValue, actionMeta);
        valueRef.current = newValue;
        setInputValue("");
    };

    const handleCreateOption = (newValue: string) => {
        const duplicateExist = checkIfExistingValueExist(newValue);
        if (!!duplicateExist) {
            setInputValue("");
            return;
        }
        handleCreate(newValue);
        setInputValue("");
    };

    const _styles = getDefaultStyles(size, styles);

    const _options = getSortedOptions<Option, Group>(options || []);

    React.useEffect(() => {
        valueRef.current = value ?? null;
    }, [value]);

    return (
        <div
            style={{
                minWidth: minWidth ?? DEFAULT_MIN_WIDTH, //
                maxWidth: maxWidth ?? DEFAULT_MAX_WIDTH,
            }}
        >
            <CreatableSelect
                id="custom-react-select-creatable"
                closeMenuOnSelect={!!isMulti ? false : true}
                hideSelectedOptions={hideSelectedOptions}
                inputValue={inputValue}
                isClearable
                isMulti={isMulti}
                maxMenuHeight={maxMenuHeight}
                menuPlacement={menuPlacement}
                menuPortalTarget={menuPortalTarget}
                menuShouldScrollIntoView={menuShouldScrollIntoView}
                onChange={handleChangeCreatableSelect}
                onCreateOption={handleCreateOption}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                styles={{ ..._styles }}
                value={value ?? (isMulti ? [] : null)}
                options={_options}
                {...props}
            />
        </div>
    );
};

export default ReactSelectCreatableComponent;
