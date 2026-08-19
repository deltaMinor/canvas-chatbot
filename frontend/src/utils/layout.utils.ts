import { DetailsSectionType } from "#root/enums/misc";

export const DEFAULT_ACTIVE_SECTION = DetailsSectionType.DASHBOARD.toString();

export const getInitialActiveSection = () => DEFAULT_ACTIVE_SECTION;
