import React from "react";

import { Box, InputBase } from "@mui/material";
import {
    GridPreProcessEditCellProps,
    GridRenderEditCellParams,
    useGridApiContext,
} from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";

import { getFileBaseName, getFileExtension } from "#root/utils/genericHelper";

const EditableFilenameCellComponent = (params: GridRenderEditCellParams) => {
    const { id, field, value } = params;
    const apiRef = useGridApiContext();

    const extensionRef = React.useRef(getFileExtension(String(value ?? "")));
    const [inputValue, setInputValue] = React.useState(getFileBaseName(String(value ?? "")));
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const commitInputValue = React.useCallback(
        async (nextBaseName: string) => {
            await apiRef.current.setEditCellValue({
                id,
                field,
                value: `${nextBaseName}${extensionRef.current}`,
            });
        },
        [apiRef, id, field]
    );

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextBaseName = event.target.value;
        setInputValue(nextBaseName);
        await commitInputValue(nextBaseName);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            apiRef.current.stopCellEditMode({ id, field });
        } else if (event.key === "Escape") {
            apiRef.current.stopCellEditMode({ id, field, ignoreModifications: true });
        }
    };

    const handleBlur = () => {
        apiRef.current.stopCellEditMode({ id, field });
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                paddingLeft: 1,
                paddingRight: 1,
            }}
        >
            <InputBase
                inputRef={inputRef}
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                fullWidth
                sx={{ fontSize: "inherit" }}
            />
            {!!extensionRef.current && (
                <Box
                    component="span"
                    sx={{
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                        paddingLeft: 0.5,
                    }}
                >
                    {extensionRef.current}
                </Box>
            )}
        </Box>
    );
};

export const preProcessFilenameEditCellProps = (params: GridPreProcessEditCellProps) => {
    const rawValue = String(params.props.value ?? "");
    const baseName = getFileBaseName(rawValue).trim();
    const isBlank = baseName.length === 0;

    if (isBlank) {
        enqueueSnackbar("File name cannot be blank.", { variant: "error" });
    }

    return { ...params.props, error: isBlank };
};

export default React.memo(EditableFilenameCellComponent);
