import { CCoPPolicy } from "./csa_ccop";
import { IM8Policy } from "./im8";
import { CSFPolicy } from "./nist_csf";

export type CompliancePolicyType = IM8Policy | CCoPPolicy | CSFPolicy;
