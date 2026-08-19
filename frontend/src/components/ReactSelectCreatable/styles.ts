import {
    CSSObjectWithLabel,
    ControlProps,
    GroupBase,
    InputProps,
    MultiValueProps,
    PlaceholderProps,
    SingleValueProps,
    StylesConfig,
    ValueContainerProps,
} from "react-select";

import { OptionLabel } from "#root/interfaces";

export const getDefaultStyles = <
    Option extends OptionLabel,
    IsMulti extends boolean,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(
    size: "small" | "medium",
    styles: StylesConfig<Option, IsMulti, Group>
) => {
    const {
        control, //
        valueContainer,
        menuPortal,
        singleValue,
        multiValueLabel,
        multiValueRemove,
        input,
        placeholder,
    } = styles;
    return {
        control: (base: CSSObjectWithLabel, _props: ControlProps<Option, IsMulti, Group>) => ({
            ...base,
            borderRadius: "4.5px",
            fontSize: "14px",
            lineHeight: 1.5,
            ":hover": { borderColor: "#5063f1" },
            ...control,
        }),
        valueContainer: (
            base: CSSObjectWithLabel,
            _props: ValueContainerProps<Option, IsMulti, Group>
        ) => ({
            ...base,
            minHeight: size === "medium" ? "51px" : "unset",
            ...valueContainer,
        }),
        menuPortal: (
            base: CSSObjectWithLabel, //
            _props: unknown
        ) => ({
            ...base, //
            zIndex: 9999,
            ...menuPortal,
        }),
        singleValue: (
            base: CSSObjectWithLabel,
            _props: SingleValueProps<Option, IsMulti, Group>
        ) => ({
            ...base,
            padding: "0 6px",
            ...singleValue,
        }),
        multiValueLabel: (
            base: CSSObjectWithLabel,
            _props: MultiValueProps<Option, IsMulti, Group>
        ) => ({
            ...base,
            fontSize: "14px",
            lineHeight: 1,
            padding: "6px 6px 6px 6px",
            // paddingLeft: "9px",
            ...multiValueLabel,
        }),
        multiValueRemove: (
            base: CSSObjectWithLabel,
            props: MultiValueProps<Option, IsMulti, Group>
        ) => {
            return props.data.isFixed //
                ? { ...base, ...multiValueRemove, display: "none" }
                : { ...base, ...multiValueRemove };
        },
        input: (base: CSSObjectWithLabel, _props: InputProps<Option, IsMulti, Group>) => ({
            ...base,
            padding: "0 6px",
            ...input,
        }),
        placeholder: (
            base: CSSObjectWithLabel,
            _props: PlaceholderProps<Option, IsMulti, Group>
        ) => ({
            ...base,
            padding: "0 6px",
            ...placeholder,
        }),
    } as StylesConfig<Option, IsMulti, Group>;
};
