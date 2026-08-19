import * as React from "react";

import { isMotionComponent, motion } from "motion/react";

import { cn } from "#root/lib/utils";

/* eslint-disable react-hooks/refs */

type AnyProps = Record<string, unknown>;

type DOMMotionProps<T extends HTMLElement = HTMLElement> = Omit<
    HTMLMotionProps<keyof HTMLElementTagNameMap>,
    "ref"
> & { ref?: React.Ref<T> };

type WithAsChild<Base extends object> =
    | (Base & { asChild: true; children: React.ReactElement })
    | (Base & { asChild?: false | undefined });

type SlotProps<T extends HTMLElement = HTMLElement> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any;
} & DOMMotionProps<T>;

function mergeProps<T extends HTMLElement>(
    childProps: AnyProps,
    slotProps: DOMMotionProps<T>
): AnyProps {
    const merged: AnyProps = { ...childProps, ...slotProps };

    const childClassName = childProps["className"] as string | undefined;
    const slotClassName = slotProps["className"] as string | undefined;
    if (childClassName || slotClassName) {
        merged["className"] = cn(childClassName || "", slotClassName || "");
    }

    const childStyle = childProps["style"] as React.CSSProperties | undefined;
    const slotStyle = slotProps["style"] as React.CSSProperties | undefined;
    if (childStyle || slotStyle) {
        merged["style"] = {
            ...(childStyle || {}),
            ...(slotStyle || {}),
        };
    }

    return merged;
}

// Cache for motion components to avoid creating them during render
const motionComponentCache = new Map<React.ElementType, React.ElementType>();

function getMotionComponent(Component: React.ElementType): React.ElementType {
    if (!motionComponentCache.has(Component)) {
        // Component is cached, so it's only created once per component type
        // This is safe because components are cached and reused
        motionComponentCache.set(Component, motion.create(Component));
    }
    const cached = motionComponentCache.get(Component);
    if (!cached) {
        throw new Error("Failed to get motion component from cache");
    }
    return cached;
}

function Slot<T extends HTMLElement = HTMLElement>({
    children,
    ref: refProp,
    ...props
}: SlotProps<T>) {
    // Validate children first, but don't return early to avoid conditional hooks
    const isValidElement = React.isValidElement(children);
    const childrenType = isValidElement ? children.type : null;

    const isAlreadyMotion = React.useMemo(
        () =>
            isValidElement &&
            typeof childrenType === "object" &&
            childrenType !== null &&
            isMotionComponent(childrenType),
        [isValidElement, childrenType]
    );

    const Base = React.useMemo(() => {
        if (!isValidElement || !childrenType) return null;
        return isAlreadyMotion
            ? (childrenType as React.ElementType)
            : getMotionComponent(childrenType as React.ElementType);
    }, [isValidElement, isAlreadyMotion, childrenType]);

    // Extract child props before early return to avoid conditional hooks
    const childPropsData = React.useMemo(() => {
        if (!isValidElement) return { ref: undefined, props: {} };
        const { ref: childRef, ...childProps } = children.props as AnyProps;
        return { ref: childRef, props: childProps };
    }, [isValidElement, children]);

    // Use useRef to store refs we can safely modify
    // This avoids React compiler warnings about modifying refs from hooks
    const childRefWrapper = React.useRef<React.Ref<T> | undefined>(undefined);
    const slotRefWrapper = React.useRef<React.Ref<T> | undefined>(undefined);

    // Update wrapper refs when source refs change
    React.useEffect(() => {
        childRefWrapper.current = childPropsData.ref as React.Ref<T> | undefined;
    }, [childPropsData.ref]);

    React.useEffect(() => {
        slotRefWrapper.current = refProp as React.Ref<T> | undefined;
    }, [refProp]);

    // Create merged ref callback - access refs from closure when callback is invoked (not during render)
    // This is the standard pattern for merging refs in React
    const mergedRef: React.Ref<T> = (node) => {
        // Access refs from closure - these are only read when callback is invoked by React
        const childRef = childRefWrapper.current;
        const slotRef = slotRefWrapper.current;

        if (childRef) {
            if (typeof childRef === "function") {
                childRef(node);
            } else {
                (childRef as React.RefObject<T | null>).current = node;
            }
        }
        if (slotRef) {
            if (typeof slotRef === "function") {
                slotRef(node);
            } else {
                (slotRef as React.RefObject<T | null>).current = node;
            }
        }
    };

    if (!isValidElement || !Base) return null;

    const mergedProps = mergeProps(childPropsData.props, props);

    return React.createElement(Base, {
        ...mergedProps,
        ref: mergedRef,
    } as React.ComponentPropsWithoutRef<typeof Base>);
}

export { Slot, type SlotProps, type WithAsChild, type DOMMotionProps, type AnyProps };
