import { UserStoryCardRefEnum } from "./diagram";
import { NodeIconKey } from "./svg";

export const UserStoryCardIconMapping = {
    [UserStoryCardRefEnum.card_feature]: NodeIconKey.genericManagementConsole,
    [UserStoryCardRefEnum.card_devices]: NodeIconKey.client,
    [UserStoryCardRefEnum.card_data]: NodeIconKey.document,
    [UserStoryCardRefEnum.card_users]: NodeIconKey.user,
    [UserStoryCardRefEnum.card_interface]: NodeIconKey.forums,
};

export enum UserStoryCardRefKeyLabel {
    card_interface = "Interface",
    card_devices = "Devices",
    card_data = "Data",
    card_users = "Users",
}
