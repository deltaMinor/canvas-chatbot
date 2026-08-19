import { Box, Typography } from "@mui/material";

import { WarningMessage } from "#root/interfaces/diagram";
import { colors } from "#root/theme/PureLightTheme";

import WarningAccordion from "./WarningAccordion";

interface WarningListProps {
    warningList: WarningMessage[];
}

const WarningListComponent = ({ warningList }: WarningListProps) => {
    return (
        <>
            {warningList?.map((warningMessage) => (
                <WarningAccordion //
                    key={warningMessage.warningId} //
                    warningMessage={warningMessage}
                    warningList={warningList}
                />
            ))}
            {!warningList?.length && (
                <Box //
                    sx={{ borderColor: colors.alpha.black[20] }}
                    className="border-1 border-dashed p-15"
                >
                    <Typography
                        variant="h4"
                        textAlign={"center"}
                    >
                        No warnings to show
                    </Typography>
                </Box>
            )}
        </>
    );
};
export default WarningListComponent;
