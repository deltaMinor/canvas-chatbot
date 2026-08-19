import { IsAuthorized } from "#root/interfaces/authorization";
import {
    BaseRegisterFields,
    RegisterCore,
    ScenarioField,
    ScenarioTabGroup,
    TagOptionLabel,
} from "#root/interfaces/register";

export interface ViewRegisterDialogRefObject<
    V extends BaseRegisterFields,
    U extends RegisterCore<V>,
> {
    viewRegisterDialogContext: ViewRegisterDialogContextInterface<V, U>;
}

export interface ViewRegisterDialogContextProps<
    V extends BaseRegisterFields,
    U extends RegisterCore<V>,
> {
    register: U;
    scenarios: V[];
    refRows: V[];
    isAuthorized: IsAuthorized;
    //
    getViewScenarioFieldGroups: (p: {
        scenario: V; //
    }) => ScenarioTabGroup<V>[];
    getViewScenarioDecisionGroups: (p: { scenario: V }) => ScenarioTabGroup<V>[];
    getViewScenarioTitleFieldGroups: (p: {
        scenario: V; //
    }) => ScenarioField<V>[];
}

export interface ViewRegisterDialogContextInterface<
    V extends BaseRegisterFields,
    U extends RegisterCore<V>,
> extends Omit<
    ViewRegisterDialogContextProps<V, U>,
    | "getViewScenarioFieldGroups"
    | "getViewScenarioDecisionGroups"
    | "getViewScenarioTitleFieldGroups"
> {
    scenario: V;
    setScenario: React.Dispatch<React.SetStateAction<V>>;
    scenarioTab: number;
    setScenarioTab: React.Dispatch<React.SetStateAction<number>>;
    //
    handleChangeTab: (v: number) => Promise<void>;
    handleFieldChange: (f: Partial<V>) => void;
    refScenario: React.RefObject<Partial<V>>;
    selectedTags: TagOptionLabel[];
    //
    viewScenarioFieldGroups: ScenarioTabGroup<V>[];
    viewScenarioDecisionGroups: ScenarioTabGroup<V>[];
    viewScenarioTitleFieldGroups: ScenarioField<V>[];
}

export interface ViewRegisterDialogContextProviderProps<
    V extends BaseRegisterFields,
    U extends RegisterCore<V>,
    REF extends ViewRegisterDialogRefObject<V, U>,
> extends ViewRegisterDialogContextProps<V, U> {
    contextRef: React.RefObject<REF>;
    refScenario: React.RefObject<Partial<V>>;
    selectedRowId: string;
    scenarios: V[];
    children?: React.ReactNode;
}
