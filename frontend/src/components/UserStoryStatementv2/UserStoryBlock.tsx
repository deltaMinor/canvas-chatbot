import React from "react";

import { Box, Typography } from "@mui/material";

import { CardValueType } from "#root/interfaces/questionnaire_card";

import ConstructorLineMark from "./ConstructorLineMark";

interface UserStoryBlockProps {
    stringMapping: {
        [key: string]: {
            defaultValue: string;
            rawValue?: CardValueType;
        };
    };
    dataTypeString: string;
    deviceTypeString: string;
    featureTypeString: string;
    intentString: string;
    interfaceTypeString: string;
    outcomeString: string;
    userTypeString: string;
}

const UserStoryBlockComponent: React.FC<UserStoryBlockProps> = ({
    stringMapping,
    dataTypeString,
    deviceTypeString,
    featureTypeString,
    intentString,
    interfaceTypeString,
    outcomeString,
    userTypeString,
}) => {
    const shouldHighlight = React.useCallback(
        (value: string, defaultValue: string = ""): boolean => {
            return value !== defaultValue && value.trim() !== "";
        },
        []
    );

    const shouldHighlightUser = React.useMemo(
        () => shouldHighlight(userTypeString, stringMapping?.["user"]?.defaultValue || ""),
        [userTypeString, stringMapping, shouldHighlight]
    );

    const shouldHighlightIntent = React.useMemo(
        () => shouldHighlight(intentString, stringMapping?.["intent"]?.defaultValue || ""),
        [intentString, stringMapping, shouldHighlight]
    );

    const shouldHighlightFeature = React.useMemo(
        () => shouldHighlight(featureTypeString, stringMapping?.["feature"]?.defaultValue || ""),
        [featureTypeString, stringMapping, shouldHighlight]
    );

    const shouldHighlightData = React.useMemo(
        () => shouldHighlight(dataTypeString, stringMapping?.["data"]?.defaultValue || ""),
        [dataTypeString, stringMapping, shouldHighlight]
    );

    const shouldHighlightDevice = React.useMemo(
        () => shouldHighlight(deviceTypeString, stringMapping?.["device"]?.defaultValue || ""),
        [deviceTypeString, stringMapping, shouldHighlight]
    );

    const shouldHighlightInterface = React.useMemo(
        () =>
            shouldHighlight(interfaceTypeString, stringMapping?.["interface"]?.defaultValue || ""),
        [interfaceTypeString, stringMapping, shouldHighlight]
    );

    const shouldHighlightOutcome = React.useMemo(
        () => shouldHighlight(outcomeString, stringMapping?.["outcome"]?.defaultValue || ""),
        [outcomeString, stringMapping, shouldHighlight]
    );

    return (
        <Box
            component="div"
            sx={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
            }}
        >
            <Typography
                component="p"
                sx={{
                    fontSize: "0.875rem",
                    lineHeight: 1.75,
                    color: "text.primary",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                }}
            >
                {"As a "}
                <ConstructorLineMark
                    key={`user-${userTypeString}`}
                    highlight={shouldHighlightUser}
                    textString={userTypeString}
                />
                {" , I want to "}
                <ConstructorLineMark
                    key={`intent-${intentString}`}
                    highlight={shouldHighlightIntent}
                    textString={intentString}
                />
                {" using "}
                <ConstructorLineMark
                    key={`feature-${featureTypeString}`}
                    highlight={shouldHighlightFeature}
                    textString={featureTypeString}
                />
                {" on "}
                <ConstructorLineMark
                    key={`data-${dataTypeString}`}
                    highlight={shouldHighlightData}
                    textString={dataTypeString}
                />
                {" by accessing the system from "}
                <ConstructorLineMark
                    key={`device-${deviceTypeString}`}
                    highlight={shouldHighlightDevice}
                    textString={deviceTypeString}
                />
                {" via a "}
                <ConstructorLineMark
                    key={`interface-${interfaceTypeString}`}
                    highlight={shouldHighlightInterface}
                    textString={interfaceTypeString}
                />
                {" , so that I can "}
                <ConstructorLineMark
                    key={`outcome-${outcomeString}`}
                    highlight={shouldHighlightOutcome}
                    textString={outcomeString}
                />
                {" ."}
            </Typography>
        </Box>
    );
};

export default React.memo(UserStoryBlockComponent);
