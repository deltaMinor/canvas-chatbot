import { DatabaseProps } from ".";
import type { MitigationMeasure } from "./register";

//////////////////////////////////////////////////
// IM8 Table

//////////////////////////////////////////////////
export interface KbIM8 extends DatabaseProps {
    im8: IM8Policy[];
}

export interface IM8Policy {
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
