import React from "react";

import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import TableRowValue from "./TableRowValue";

interface KeyValueTableProps<T extends object> {
    headers?: string[];
    data: T;
    sortedFieldkeys: string[];
    keyLabelMapping: { [key: string]: string };
    customComponentMapping?: Record<string, React.FC<{ fieldValue: unknown }>>;
}

const KeyValueTableComponent = <T extends object>({
    data: props__data,
    keyLabelMapping,
    //
    headers = [], //
    sortedFieldkeys = [],
    customComponentMapping = {},
}: KeyValueTableProps<T>) => {
    const data = Object.entries(props__data || {}).reduce(
        (acc, [k, v]) => {
            acc[k] = (
                <TableRowValue //
                    fieldKey={k}
                    fieldValue={v}
                    customComponentMapping={customComponentMapping}
                />
            );
            return acc;
        },
        {} as Record<string, React.ReactNode>
    );
    return (
        <Box //
            className="p-1"
            style={{ backgroundColor: "#f2f5f9" }}
        >
            <Table style={{ backgroundColor: "#fff" }}>
                <TableHead>
                    <TableRow>
                        {headers?.map((h, hIdx) => {
                            return (
                                <TableCell //
                                    key={hIdx}
                                >
                                    {h}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedFieldkeys?.map((fieldKey, fieldKeyIdx) => {
                        return (
                            <TableRow key={fieldKeyIdx}>
                                <TableCell>
                                    <Typography
                                        variant="h6"
                                        whiteSpace="nowrap"
                                        maxWidth="300px"
                                    >
                                        {keyLabelMapping?.[fieldKey] || fieldKey}
                                    </Typography>
                                </TableCell>
                                <TableCell>{data[fieldKey]}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
};

export default React.memo(KeyValueTableComponent) as typeof KeyValueTableComponent;
