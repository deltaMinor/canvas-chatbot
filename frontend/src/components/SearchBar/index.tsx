import React from "react";

import SearchIcon from "@mui/icons-material/Search";
import { Stack } from "@mui/material";

import MuiTextField from "#root/components/MuiTextField";

interface SearchBarComponentProps {
    handleUpdateSearchString: (value?: number | string | string[]) => Promise<void>;
}

const SearchBarComponent = ({ handleUpdateSearchString }: SearchBarComponentProps) => {
    return (
        <div>
            <Stack //
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
            >
                <MuiTextField //
                    id={"MuiTextField-AccordionSearchFieldComponent"}
                    //
                    endAdornmentIcon={<SearchIcon />}
                    handleSubmit={handleUpdateSearchString}
                    placeholder="Search"
                    style={{ width: "200px" }}
                />
            </Stack>
        </div>
    );
};

export default React.memo(SearchBarComponent);
