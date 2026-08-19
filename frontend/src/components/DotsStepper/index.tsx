import React from "react";

import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { Typography } from "@mui/material";
import MobileStepper from "@mui/material/MobileStepper";
import { FormikValues } from "formik";

import MuiButton from "#root/components/MuiButton";

const DotsStepperStyle = {
    maxWidth: 400,
    flexGrow: 1,
    "&.MuiMobileStepper-root": {
        maxWidth: "100%",
    },
    "& .MuiButtonBase-root": {
        fontSize: "1rem",
    },
    "& .MuiMobileStepper-dots": {
        display: "None",
    },
};

interface DotsMobileStepperComponentProps {
    finalStepTitle: string;
    isLastStep: boolean;
    onBackClick: (values: FormikValues) => void;
    onNextClick: (values: FormikValues) => void;
    sectionsLength: number;
    stepNumber: number;
    isNextButtonDisabled: boolean;
    isBackButtonDisabled: boolean;
}

const DotsMobileStepperComponent = ({
    finalStepTitle,
    isLastStep,
    onBackClick,
    onNextClick,
    sectionsLength,
    stepNumber,
    isNextButtonDisabled,
    isBackButtonDisabled,
}: DotsMobileStepperComponentProps) => {
    return (
        <MobileStepper
            style={{ backgroundColor: "unset" }}
            variant="dots"
            steps={sectionsLength}
            position="static"
            activeStep={stepNumber}
            sx={DotsStepperStyle}
            nextButton={
                <MuiButton
                    color="primary"
                    disabled={!!isNextButtonDisabled} // disable check for completed form
                    endIcon={
                        !!isLastStep ? ( //
                            <KeyboardDoubleArrowRightIcon />
                        ) : (
                            <KeyboardArrowRight />
                        )
                    }
                    onClick={onNextClick}
                    size="medium"
                    variant="contained"
                >
                    <Typography
                        variant="button" //
                    >
                        {isLastStep ? finalStepTitle : "Next"}
                    </Typography>
                </MuiButton>
            }
            backButton={
                <MuiButton
                    color="primary"
                    disabled={!!isBackButtonDisabled}
                    onClick={onBackClick}
                    size="medium"
                    startIcon={<KeyboardArrowLeft />}
                    variant="contained"
                >
                    <Typography
                        variant="button" //
                    >
                        Back
                    </Typography>
                </MuiButton>
            }
        />
    );
};

export default React.memo(DotsMobileStepperComponent);
