import { Box, Divider, Stack, Typography } from "@mui/material";

interface FullWidthWordedDividerProps {
    title: string;
}

const FullWidthWordedDividerComponent = ({ title }: FullWidthWordedDividerProps) => {
    return (
        <Box //
            className="w-full"
        >
            <Stack //
                direction="row"
                justifyContent="center"
                alignItems="center"
            >
                <Box //
                    className="flex-1"
                >
                    <Divider />
                </Box>
                <Box //
                    className="p-3"
                >
                    <Typography>{title}</Typography>
                </Box>
                <Box //
                    className="flex-1"
                >
                    <Divider />
                </Box>
            </Stack>
        </Box>
    );
};

export default FullWidthWordedDividerComponent;
