import React from "react";

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

const UserStoryBlockComponent = ({
    stringMapping,
    dataTypeString,
    deviceTypeString,
    featureTypeString,
    intentString,
    interfaceTypeString,
    outcomeString,
    userTypeString,
}: UserStoryBlockProps) => {
    const shouldHighlight = (
        value: string, //
        defaultValue = ""
    ) => {
        return value !== defaultValue;
    };

    const shouldHighlightUserData = shouldHighlight(
        dataTypeString, //
        stringMapping?.["data"]?.defaultValue
    );
    const shouldHighlightUserDevice = shouldHighlight(
        deviceTypeString, //
        stringMapping?.["device"]?.defaultValue
    );
    const shouldHighlightUserFeature = shouldHighlight(
        featureTypeString, //
        stringMapping?.["feature"]?.defaultValue
    );
    const shouldHighlightUserIntent = shouldHighlight(
        intentString, //
        stringMapping?.["intent"]?.defaultValue
    );
    const shouldHighlightUserInterface = shouldHighlight(
        interfaceTypeString, //
        stringMapping?.["interface"]?.defaultValue
    );
    const shouldHighlightUser = shouldHighlight(
        userTypeString, //
        stringMapping?.["user"]?.defaultValue
    );
    const shouldHighlightUserOutcome = shouldHighlight(
        outcomeString, //
        stringMapping?.["outcome"]?.defaultValue
    );

    return (
        <>
            {"As a "}
            <ConstructorLineMark
                key={`user-${userTypeString}`} //
                highlight={shouldHighlightUser}
                textString={userTypeString}
            />
            {" , I want to "}
            <ConstructorLineMark
                key={`intent-${intentString}`} //
                highlight={shouldHighlightUserIntent}
                textString={intentString}
            />
            {" using "}
            <ConstructorLineMark
                key={`feature-${featureTypeString}`} //
                highlight={shouldHighlightUserFeature}
                textString={featureTypeString}
            />
            {" on "}
            <ConstructorLineMark
                key={`data-${dataTypeString}`} //
                highlight={shouldHighlightUserData}
                textString={dataTypeString}
            />
            {" by accessing the system from "}
            <ConstructorLineMark
                key={`device-${deviceTypeString}`} //
                highlight={shouldHighlightUserDevice}
                textString={deviceTypeString}
            />
            {" via a "}
            <ConstructorLineMark
                key={`interface-${interfaceTypeString}`} //
                highlight={shouldHighlightUserInterface}
                textString={interfaceTypeString}
            />
            {" , so that I can "}
            <ConstructorLineMark
                key={`outcome-${outcomeString}`} //
                highlight={shouldHighlightUserOutcome}
                textString={outcomeString}
            />
            {" ."}
        </>
    );
};

export default React.memo(UserStoryBlockComponent);
