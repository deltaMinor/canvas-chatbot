import * as React from "react";
import { Theme as MuiTheme } from "@mui/material/styles";
import { SxProps as MuiSxProps } from "@mui/system";
import { PayloadAction as ReduxPayloadAction } from "@reduxjs/toolkit";
import { ClassValue as ClsxClassValue } from "clsx";
import { HTMLMotionProps as MotionHTMLProps, LegacyAnimationControls as MotionLegacyAnimationControls, MotionStyle as MotionMotionStyle, TargetAndTransition as MotionTargetAndTransition, Transition as MotionTransition } from "motion/react";
import { Metric as WebVitalsMetric } from "web-vitals";

declare global {
    type HTMLMotionProps<T extends keyof HTMLElementTagNameMap> = MotionHTMLProps<T>;
    type LegacyAnimationControls = MotionLegacyAnimationControls;
    type MotionStyle = MotionMotionStyle;
    type TargetAndTransition = MotionTargetAndTransition;
    type Transition = MotionTransition;

    type PayloadAction<T = void> = ReduxPayloadAction<T>;
    type RootState = import("#root/redux/store").RootState;

    type Theme = MuiTheme;
    type SxProps<T extends object = MuiTheme> = MuiSxProps<T>;
    type ClassValue = ClsxClassValue;
    type Metric = WebVitalsMetric;

    type WithAsChild<Base extends object> =
        import("#root/components/animate-ui/primitives/animate/slot").WithAsChild<Base>;
    type HighlightProps<T extends React.ElementType = "div"> =
        import("#root/components/animate-ui/primitives/effects/highlight").HighlightProps<T>;
    type HighlightItemProps<T extends React.ElementType = "div"> =
        import("#root/components/animate-ui/primitives/effects/highlight").HighlightItemProps<T>;
    type AutoHeightProps =
        import("#root/components/animate-ui/primitives/effects/auto-height").AutoHeightProps;

    type FieldConfig =
        import("#root/components/AttackFlowDialogv2/AttackFlowsDetails/fieldConfigs").FieldConfig;
    type UserPolicyDoc = import("#root/interfaces/authorization").UserPolicyDoc;
    type CustomFieldGroup = import("#root/interfaces/diagramAttributes").CustomFieldGroup;
}

