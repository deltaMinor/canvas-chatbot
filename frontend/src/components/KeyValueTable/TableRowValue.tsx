import React from "react";

import { List, ListItem, Typography } from "@mui/material";

import Markdown from "#root/components/Markdown";

interface TableRowValueProps {
    fieldKey?: string;
    fieldValue: unknown;
    customComponentMapping?: Record<string, React.FC<{ fieldValue: unknown }>>;
}

const TableRowValueComponent = ({
    fieldKey = "",
    fieldValue, //
    customComponentMapping,
}: TableRowValueProps) => {
    if (!!customComponentMapping?.[fieldKey]) {
        const Component = customComponentMapping[fieldKey];
        return <Component fieldValue={fieldValue} />;
    }

    if (typeof fieldValue === "string") {
        return <Markdown text={fieldValue} />;
    } else if (typeof fieldValue === "boolean") {
        return <Typography>{fieldValue.toString()}</Typography>;
    } else if (typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
        return (
            <List disablePadding>
                {Object.entries(fieldValue || {}).map(([k, v], fIdx) => (
                    <ListItem //
                        key={fIdx}
                        dense
                        className="px-0"
                    >
                        <TableRowValueComponent //
                            fieldKey={k}
                            fieldValue={v}
                        />
                    </ListItem>
                ))}
            </List>
        );
    } else if (!!Array.isArray(fieldValue)) {
        return (
            <List disablePadding>
                {fieldValue.map((v, vIdx) => {
                    return (
                        <ListItem //
                            key={vIdx}
                            dense
                            className="px-0"
                        >
                            <TableRowValueComponent //
                                fieldValue={v}
                            />
                        </ListItem>
                    );
                })}
            </List>
        );
    }
    return <></>;
};

export default React.memo(TableRowValueComponent) as typeof TableRowValueComponent;
