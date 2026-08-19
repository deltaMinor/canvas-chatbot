import React from "react";

import { Box, Typography } from "@mui/material";

interface OdometerPercentageProps {
    valueText: string;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DIGIT_HEIGHT_PX = 14;
const DIGIT_WIDTH_PX = 8;

interface OdometerDigitProps {
    digit: string;
    delayMs?: number;
}

const OdometerDigit = ({ digit, delayMs = 0 }: OdometerDigitProps) => {
    const safeDigit = /^\d$/.test(digit) ? digit : "0";
    const digitValue = Number(safeDigit);

    return (
        <Box
            className="mui-progress-odometer__digit-window"
            sx={{
                height: `${DIGIT_HEIGHT_PX}px`,
                width: `${DIGIT_WIDTH_PX}px`,
            }}
        >
            <Box
                className="mui-progress-odometer__digit-track"
                sx={{
                    transform: `translateY(-${digitValue * DIGIT_HEIGHT_PX}px)`,
                    transitionDelay: `${delayMs}ms`,
                }}
            >
                {DIGITS.map((value) => (
                    <Typography
                        key={value}
                        variant="caption"
                        component="div"
                        color="text.secondary"
                        className="mui-progress-odometer__digit-char"
                        sx={{
                            height: `${DIGIT_HEIGHT_PX}px`,
                            lineHeight: `${DIGIT_HEIGHT_PX}px`,
                            width: `${DIGIT_WIDTH_PX}px`,
                        }}
                    >
                        {value}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
};

const OdometerPercentageComponent = ({ valueText }: OdometerPercentageProps) => {
    const characters = valueText.split("");

    return (
        <Box className="mui-progress-odometer">
            <Box
                className="mui-progress-odometer__text"
                sx={{ lineHeight: `${DIGIT_HEIGHT_PX}px` }}
            >
                {characters.map((char, index) =>
                    /\d/.test(char) ? (
                        <OdometerDigit
                            key={`digit-${index}`}
                            digit={char}
                            delayMs={index * 40}
                        />
                    ) : (
                        <Typography
                            key={`symbol-${index}`}
                            variant="caption"
                            component="span"
                            color="text.secondary"
                            className="mui-progress-odometer__symbol"
                            sx={{ lineHeight: `${DIGIT_HEIGHT_PX}px` }}
                        >
                            {char}
                        </Typography>
                    )
                )}
            </Box>
        </Box>
    );
};

const OdometerPercentage = React.memo(
    OdometerPercentageComponent
) as typeof OdometerPercentageComponent;
export default OdometerPercentage;
