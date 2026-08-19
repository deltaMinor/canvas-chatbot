import { Typography } from "@mui/material";

interface WarningAccordionRowProps {
    title: string;
    body: string;
}

const WarningAccordionRowComponent = ({
    title, //
    body,
}: WarningAccordionRowProps) => {
    return (
        <div>
            <Typography //
                fontStyle="italic"
                gutterBottom
            >
                {title}
            </Typography>
            <Typography //
            // variant="body1"
            >
                {body}
            </Typography>
        </div>
    );
};

export default WarningAccordionRowComponent;
