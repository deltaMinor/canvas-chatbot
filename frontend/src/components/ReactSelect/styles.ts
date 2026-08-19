import {
    CSSObjectWithLabel,
    ControlProps,
    GroupBase,
    GroupHeadingProps,
    GroupProps,
    InputProps,
    MultiValueProps,
    OptionProps,
    PlaceholderProps,
    SingleValueProps,
    ValueContainerProps,
} from "react-select";

import { OptionLabel } from "#root/interfaces";

export const getDefaultStyles: (size: "small" | "medium") => {
    [key: string]: unknown;
} = <Option extends OptionLabel, IsMulti extends boolean, Group extends GroupBase<Option>>(
    size: "small" | "medium" = "medium" //
) => {
    return {
        control: (base: CSSObjectWithLabel, _props: ControlProps<Option, IsMulti, Group>) => ({
            ...base,
            borderRadius: "4.5px",
            fontSize: "14px",
            lineHeight: 1.5,
            ":hover": { borderColor: "#5063f1" },
        }),
        valueContainer: (
            base: CSSObjectWithLabel,
            _props: ValueContainerProps<Option, IsMulti, Group>
        ) => ({
            ...base,
            minHeight: size === "medium" ? "51px" : "unset",
        }),
        menuPortal: (
            base: CSSObjectWithLabel, //
            _props: unknown
        ) => ({
            ...base, //
            zIndex: 9999,
        }),
        singleValue: (
            base: CSSObjectWithLabel,
            _props: SingleValueProps<Option, IsMulti, Group>
        ) => ({
            ...base,
            padding: "0 6px",
        }),
        input: (base: CSSObjectWithLabel, _props: InputProps<Option, IsMulti, Group>) => ({
            ...base,
            padding: "0 6px",
        }),
        placeholder: (
            base: CSSObjectWithLabel,
            _props: PlaceholderProps<Option, IsMulti, Group>
        ) => ({
            ...base,
            padding: "0 6px",
        }),
        option: (base: CSSObjectWithLabel, _props: OptionProps<Option, IsMulti, Group>) => {
            const { isSelected } = _props;
            return {
                ...base,
                fontSize: "14px",
                backgroundColor: !!isSelected ? "#5569ff" : base["backgroundColor"],
            };
        },
        groupHeading: (
            base: CSSObjectWithLabel,
            _props: GroupHeadingProps<Option, IsMulti, Group>
        ) => {
            return {
                ...base, //
                fontSize: "13px",
                color: "#cccccc",
                textAlign: "left",
                borderTop: "1px solid #cccccc",
                lineHeight: 2,
            };
        },
        group: (base: CSSObjectWithLabel, _props: GroupProps<Option, IsMulti, Group>) => {
            return {
                ...base, //
                fontSize: "14px",
                color: "#223354",
                // backgroundColor: base.backgroundColor,
                // backgroundColor: props.isSelected
                //     ? "#5569ff"
                //     : base.backgroundColor,
                // color: props.isSelected ? "#fff" : "#223354",
            };
        },
        multiValueLabel: (
            base: CSSObjectWithLabel,
            props: MultiValueProps<Option, IsMulti, Group>
        ) => {
            const option = (props.options as Option[])?.find(
                (opt) => opt?.value === props.data?.value
            );
            return !!option?.isFixed
                ? {
                      ...base, //
                      paddingRight: 6,
                      backgroundColor: "#647087",
                      color: "#fff",
                      fontSize: "14px",
                  }
                : { ...base, fontSize: "14px" };
        },
        multiValueRemove: (
            base: CSSObjectWithLabel,
            props: MultiValueProps<Option, IsMulti, Group>
        ) => {
            const option = (props.options as Option[])?.find(
                (opt) => opt?.value === props.data?.value
            );
            return !!option?.isFixed
                ? {
                      ...base,
                      display: "none",
                  }
                : base;
        },
    };
};

export const groupStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};
