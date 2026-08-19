import React, { memo } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Collapse, IconButton, Table, TableBody, TableCell, TableRow } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

interface SelectableValueComponent {
    label: string;
    value: string | number;
    data?: SelectableValueComponent[];
    Component?: () => React.ReactNode;
}

interface ExpandableTableRowProps {
    row: SelectableValueComponent;
}

const ExpandableTableRowComponent = ({ row }: ExpandableTableRowProps) => {
    const [expandRow, setExpandRow] = React.useState<boolean>(false);

    return (
        <>
            <TableRow>
                <TableCell //
                    className="border-0 p-0"
                >
                    <IconButton
                        size="small"
                        style={{ borderRadius: 0 }}
                        onClick={() => setExpandRow(!expandRow)}
                    >
                        {expandRow ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell
                    align="right"
                    sx={{
                        color: colors.primary.main, //
                    }}
                    className="border-0 font-semibold"
                >
                    {row?.label}
                </TableCell>
                <TableCell //
                    align="right"
                    className="border-0 py-1 pr-2 pl-0"
                >
                    {row?.value}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell //
                    colSpan={3}
                    className="m-0 p-0"
                >
                    <Collapse
                        in={expandRow}
                        timeout="auto"
                        unmountOnExit
                    >
                        <Table size="small">
                            <TableBody>
                                {row?.data?.map((d) => {
                                    return (
                                        <TableRow key={d?.label}>
                                            <TableCell //
                                                className="m-0 border-0 p-0"
                                            >
                                                {d?.Component && d?.Component()}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                className="border-0"
                                            >
                                                {d?.label}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                className="border-0 p-1"
                                            >
                                                {d?.value}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default memo(ExpandableTableRowComponent);
