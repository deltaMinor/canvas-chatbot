import React from "react";

import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";

import MuiChip from "#root/components/MuiChip";

type SimpleTableRowRender = "typography" | "chips";

export interface SimpleTableBodyItem {
    label: string;
    color?: string;
    link?: string;
}

export interface SimpleTableValue {
    title: string;
    body: SimpleTableBodyItem | SimpleTableBodyItem[];
}

interface SimpleTableProps {
    values: SimpleTableValue[];
    renderAs?: SimpleTableRowRender;
}

const SimpleTableComponent = ({ values, renderAs = "typography" }: SimpleTableProps) => {
    const openExternalLink = React.useCallback((link: string) => {
        window.open(link, "_blank", "noopener,noreferrer");
    }, []);

    const getBodyItems = React.useCallback((body: SimpleTableValue["body"]) => {
        const bodyItems = Array.isArray(body) ? body : [body];

        return bodyItems.filter((item) => !!item?.label?.trim());
    }, []);

    const renderBodyItemText = (item: SimpleTableBodyItem) => {
        if (!item.link) {
            return (
                <Typography
                    className="components-simple-table__body-text"
                    component="span"
                    variant="body2"
                >
                    {item.label}
                </Typography>
            );
        }

        return (
            <ButtonBase
                className="components-simple-table__link-button"
                component="button"
                type="button"
                onClick={() => openExternalLink(item.link!)}
            >
                <Typography
                    className="components-simple-table__link-text"
                    component="span"
                    variant="body2"
                >
                    {item.label}
                </Typography>
                <OpenInNewRoundedIcon className="components-simple-table__link-icon" />
            </ButtonBase>
        );
    };

    const renderRightCell = (row: SimpleTableValue) => {
        const validItems = getBodyItems(row.body);

        if (!validItems.length) {
            return (
                <Typography
                    className="components-simple-table__muted-text"
                    component="span"
                    variant="body2"
                >
                    None
                </Typography>
            );
        }

        if (renderAs === "chips") {
            return (
                <Stack
                    className="components-simple-table__chip-list"
                    direction="row"
                    useFlexGap
                    flexWrap="wrap"
                >
                    {validItems.map((item, index) => (
                        <MuiChip
                            key={`${row.title}-${item.label}-${index}`}
                            label={item.label}
                            size="small"
                            clickable={!!item.link}
                            {...(item.color && {
                                style: {
                                    backgroundColor: item.color,
                                    color: "#fff",
                                },
                            })}
                            {...(item.link && {
                                onClick: () => openExternalLink(item.link!),
                            })}
                        />
                    ))}
                </Stack>
            );
        }

        return (
            <Stack className="components-simple-table__text-list">
                {validItems.map((item, index) => (
                    <Stack
                        className="components-simple-table__text-item"
                        key={`${row.title}-${item.label}-${index}`}
                        direction="row"
                        alignItems="flex-start"
                    >
                        {validItems.length > 1 && (
                            <Typography
                                className="components-simple-table__index-badge"
                                component="span"
                                variant="caption"
                            >
                                {index + 1}
                            </Typography>
                        )}
                        {renderBodyItemText(item)}
                    </Stack>
                ))}
            </Stack>
        );
    };

    if (!values.length) {
        return (
            <Box className="components-simple-table__empty">
                <Typography
                    className="components-simple-table__muted-text"
                    variant="body2"
                >
                    None
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            className="components-simple-table"
            component="dl"
        >
            {values.map((row) => (
                <Box
                    className="components-simple-table__row"
                    key={row.title}
                >
                    <Typography
                        className="components-simple-table__label"
                        component="dt"
                        variant="body2"
                    >
                        {row.title}
                    </Typography>
                    <Box
                        className="components-simple-table__value"
                        component="dd"
                    >
                        {renderRightCell(row)}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default React.memo(SimpleTableComponent);
