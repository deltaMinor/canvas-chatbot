import { DatabaseProps } from ".";
import type { MitigationMeasure } from "./register";

//////////////////////////////////////////////////
// Codes Of Practice Table

//////////////////////////////////////////////////
export interface KbCsaCCoP extends DatabaseProps {
    csa_ccop: CCoPPolicy[];
}

export interface CCoPPolicy {
    id: string;
    //
    annex_ref: string;
    category: string;
    domain: string;
    footnote_ref: string;
    guideline_ref: string;
    image_name: string;
    image_url: string;
    policy_ref: string;
    std_ref: string;
    subdomain: string;
    tags: string;
    text: string;
    // Mitigation measures associated with this policy (backend-provided).
    mitigations?: MitigationMeasure[];
}
