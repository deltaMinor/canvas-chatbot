import { DatabaseProps } from ".";
import type { MitigationMeasure } from "./register";

//////////////////////////////////////////////////
// NIST CSF Table

//////////////////////////////////////////////////
export interface KbISOIEC27001 extends DatabaseProps {
    isoiec_27001: ISOIEC27001[];
}

export interface ISOIEC27001 {
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
