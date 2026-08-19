import React, { type ComponentProps } from "react";

import { Stack, TextField, Theme, styled } from "@mui/material";
import { DataGrid, QuickFilter, ToolbarButton } from "@mui/x-data-grid";
import { clsx } from "clsx";

type StyledDataGridProps = ComponentProps<typeof DataGrid>;

export const StyledDataGrid = ({ className, ...props }: StyledDataGridProps) => (
    <DataGrid
        className={clsx(
            "components-mui-data-grid-table-mui-data-grid__styled-data-grid",
            className
        )}
        {...props}
    />
);

type StyledDataGridToolbarStackProps = ComponentProps<typeof Stack>;

export const StyledDataGridToolbarStack = ({
    className,
    ...props
}: StyledDataGridToolbarStackProps) => (
    <Stack
        className={clsx(
            "components-mui-data-grid-table-mui-data-grid__styled-data-grid-toolbar-stack",
            className
        )}
        {...props}
    />
);

type StyledQuickFilterProps = ComponentProps<typeof QuickFilter>;

export const StyledQuickFilter: typeof QuickFilter = (({
    className,
    ...props
}: StyledQuickFilterProps) => (
    <QuickFilter
        className={clsx(
            "components-mui-data-grid-table-mui-data-grid__styled-quick-filter",
            className
        )}
        {...props}
    />
)) as typeof QuickFilter;

export const StyledToolbarButton = styled(
    ToolbarButton as React.ComponentType<Record<string, unknown>>
)(({ theme, ownerState }: { theme: Theme; ownerState: { expanded: boolean } }) => ({
    gridArea: "1 / 1",
    width: "min-content",
    height: "min-content",
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? "none" : "auto",
    transition: theme.transitions.create(["opacity"]),
}));

export const StyledTextField = styled(TextField)<{
    ownerState: { expanded: boolean };
}>(({ theme, ownerState }) => ({
    gridArea: "1 / 1",
    overflowX: "clip",
    width: ownerState.expanded ? 260 : "var(--trigger-width)",
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(["width", "opacity"]),
}));
