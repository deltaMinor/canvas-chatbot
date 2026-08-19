import React from "react";

import { userStoryStringMapping } from "#root/constants/questionnaire";
import { UserStoryStringEnum } from "#root/interfaces/questionnaire";
import { StoryStringMapping } from "#root/interfaces/questionnaire_card";

import UserStoryBlock from "./UserStoryBlock";
import { getValueString } from "./helper";

interface UserStoryStatementProps {
    stringMapping: StoryStringMapping;
}

const UserStoryStatementComponent: React.FC<UserStoryStatementProps> = ({ stringMapping }) => {
    const dataTypeString = React.useMemo(
        () => getValueString(UserStoryStringEnum.data, stringMapping),
        [stringMapping]
    );

    const deviceTypeString = React.useMemo(
        () => getValueString(UserStoryStringEnum.device, stringMapping),
        [stringMapping]
    );

    const featureTypeString = React.useMemo(
        () => getValueString(UserStoryStringEnum.feature, stringMapping),
        [stringMapping]
    );

    const intentString = React.useMemo(
        () => getValueString(UserStoryStringEnum.intent, stringMapping),
        [stringMapping]
    );

    const interfaceTypeString = React.useMemo(
        () => getValueString(UserStoryStringEnum.interface, stringMapping),
        [stringMapping]
    );

    const outcomeString = React.useMemo(
        () => getValueString(UserStoryStringEnum.outcome, stringMapping),
        [stringMapping]
    );

    const userTypeString = React.useMemo(
        () => getValueString(UserStoryStringEnum.user, stringMapping),
        [stringMapping]
    );

    return (
        <UserStoryBlock
            stringMapping={userStoryStringMapping}
            dataTypeString={dataTypeString}
            deviceTypeString={deviceTypeString}
            featureTypeString={featureTypeString}
            intentString={intentString}
            interfaceTypeString={interfaceTypeString}
            outcomeString={outcomeString}
            userTypeString={userTypeString}
        />
    );
};

export default React.memo(UserStoryStatementComponent);
