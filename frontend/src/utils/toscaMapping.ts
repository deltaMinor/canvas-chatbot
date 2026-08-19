import { KBTosca, ToscaMapping } from "#root/interfaces/tosca";

export const getToscaSchema = (kbTosca?: KBTosca | null) => kbTosca?.schema_ || "";

export const getToscaMappingMapped = (kbTosca?: KBTosca | null) =>
    Object.values(kbTosca?.tosca_mapping?.mapping_to_individual || {}).reduce((acc, value) => {
        return { ...acc, ...value };
    }, {} as ToscaMapping);

export const getToscaMappingUnmapped = (kbTosca?: KBTosca | null) =>
    Object.values(kbTosca?.tosca_mapping?.mapping_to_class || {}).reduce((acc, value) => {
        return { ...acc, ...value };
    }, {} as ToscaMapping);

export const getMergedToscaMapping = (kbTosca?: KBTosca | null): ToscaMapping => ({
    ...getToscaMappingMapped(kbTosca),
    ...getToscaMappingUnmapped(kbTosca),
});
