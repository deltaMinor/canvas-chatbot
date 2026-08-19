import React from "react";

import { userStoryStringMapping } from "#root/constants/questionnaire";
import { UserStoryStringEnum } from "#root/interfaces/questionnaire";
import { StoryStringMapping } from "#root/interfaces/questionnaire_card";

import UserStoryBlock from "./UserStoryBlock";
import { getValueString } from "./helper";

interface UserStoryStatementProps {
    stringMapping: StoryStringMapping;
}

const UserStoryStatementComponent = ({ stringMapping }: UserStoryStatementProps) => {
    const dataTypeString = getValueString(UserStoryStringEnum.data, stringMapping);
    const deviceTypeString = getValueString(UserStoryStringEnum.device, stringMapping);
    const featureTypeString = getValueString(UserStoryStringEnum.feature, stringMapping);
    const intentString = getValueString(UserStoryStringEnum.intent, stringMapping);
    const interfaceTypeString = getValueString(UserStoryStringEnum.interface, stringMapping);
    const outcomeString = getValueString(UserStoryStringEnum.outcome, stringMapping);
    const userTypeString = getValueString(UserStoryStringEnum.user, stringMapping);

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
