import { DatabaseProps } from ".";
import type { MitigationMeasure } from "./register";

//////////////////////////////////////////////////
// NIST CSF Table

//////////////////////////////////////////////////
export interface KbNistCSF extends DatabaseProps {
    nist_csf: CSFPolicy[];
}

export interface CSFPolicy {
    id: string;
    //
    policy_ref: string;
    category: string;
    text: string;
    // Mitigation measures associated with this policy (backend-provided).
    mitigations?: MitigationMeasure[];
}
