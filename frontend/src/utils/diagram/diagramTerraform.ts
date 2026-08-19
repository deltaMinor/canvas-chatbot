import { terraform_mapping } from "#root/constants/terraformMapping";
import { NodeIconKey } from "#root/interfaces/svg";

export const getTerraformType = (label: string) => {
    return `${terraform_mapping[label] || ""}`;
};

export const getIconType = (terraform_type: string) => {
    for (const icon in terraform_mapping)
        if (terraform_mapping[icon] === terraform_type) return icon;
    return NodeIconKey.genericServer;
};
