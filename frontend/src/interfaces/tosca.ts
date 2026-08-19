export interface ToscaMapping {
    [key: string]: string;
}

interface KBToscaMapping {
    cluster_icon_key: { [key: string]: string };
    cluster_terraform: { [key: string]: string };
    terraform: { [key: string]: string };
    dataflow_icon_key: { [key: string]: string };
    icon_key: { [key: string]: string };
}
export interface KBTosca {
    tosca_mapping: {
        mapping_to_individual: KBToscaMapping;
        mapping_to_class: KBToscaMapping;
    };
    schema_: string;
}
