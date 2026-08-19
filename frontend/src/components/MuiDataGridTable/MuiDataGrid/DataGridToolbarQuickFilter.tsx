import React from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, Theme, Tooltip } from "@mui/material";
import { QuickFilterClear, QuickFilterControl, QuickFilterTrigger } from "@mui/x-data-grid";

import { StyledQuickFilter, StyledTextField, StyledToolbarButton } from "./styled";

interface DataGridToolbarQuickFilterProps {}

const DataGridToolbarQuickFilterComponent = (_props: DataGridToolbarQuickFilterProps) => {
    return (
        <StyledQuickFilter>
            <QuickFilterTrigger
                render={(triggerProps, state) => (
                    <Tooltip
                        title="Search"
                        enterDelay={0}
                    >
                        <StyledToolbarButton
                            {...triggerProps}
                            theme={{} as Theme & Record<string, unknown>}
                            ownerState={{ expanded: state.expanded }}
                            color="default"
                            aria-disabled={state.expanded}
                        >
                            <SearchIcon fontSize="small" />
                        </StyledToolbarButton>
                    </Tooltip>
                )}
            />
            <QuickFilterControl
                render={({ ref, ...controlProps }, state) => (
                    <StyledTextField
                        {...controlProps}
                        ownerState={{ expanded: state.expanded }}
                        inputRef={ref || null}
                        aria-label="Search"
                        placeholder="Search..."
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: state.value ? (
                                    <InputAdornment position="end">
                                        <QuickFilterClear
                                            edge="end"
                                            size="small"
                                            aria-label="Clear search"
                                            material={{
                                                sx: { marginRight: -0.75 },
                                            }}
                                        >
                                            <CancelIcon fontSize="small" />
                                        </QuickFilterClear>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />
                )}
            />
        </StyledQuickFilter>
    );
};

export default React.memo(DataGridToolbarQuickFilterComponent);
