import React from "react";

import { Stack } from "@mui/material";

import KeyValueTable from "#root/components/KeyValueTable";
import { MitigationMeasure } from "#root/interfaces/register";

interface PolicyListProps<T extends object> {
    policyList: T[];
    keys_to_omit: string[];
    keys_order: string[];
    customComponentMapping: {
        image_url: (props: { fieldValue: unknown }) => React.ReactElement;
    };
    keyLabelMapping: Record<string, string>;
}

/** Field keys to render, minus the omitted ones, ordered by `keysOrder`. */
const getSortedFieldKeys = (
    policy: object,
    keysToOmit: string[],
    keysOrder: string[],
): string[] =>
    Object.keys(policy || {})
        .filter((key) => !keysToOmit.includes(key))
        .sort((a, b) => keysOrder.indexOf(a) - keysOrder.indexOf(b));

/**
 * Render a single mitigation as labelled lines (ID / Header / Measure / Category)
 * instead of the raw object. Lines are joined with a Markdown hard break ("  \n")
 * so they render on separate rows. Returns "" for mitigations without a measure.
 */
const formatMitigation = ({
    measure,
    mitigationId,
    category,
    header,
}: Partial<MitigationMeasure>): string => {
    if (!measure) return "";

    const categoryLabel = Array.isArray(category) ? category.join(", ") : "";
    return [
        `**ID:** ${mitigationId ?? ""}`,
        `**Header:** ${header ?? ""}`,
        `**Measure:** ${measure}`,
        `**Category:** ${categoryLabel}`,
    ].join("  \n");
};

/** Replace the raw `mitigations` array (if any) with formatted, non-empty lines. */
const getDisplayData = <T extends object>(policy: T): T => {
    const rawMitigations = (policy as { mitigations?: Partial<MitigationMeasure>[] })?.mitigations;
    if (!Array.isArray(rawMitigations)) return policy;

    return {
        ...policy,
        mitigations: rawMitigations.map(formatMitigation).filter((entry) => entry.length > 0),
    };
};

const PolicyList = <T extends object>({
    policyList,
    keys_to_omit,
    keys_order,
    customComponentMapping,
    keyLabelMapping,
}: PolicyListProps<T>) => {
    return (
        <Stack spacing={2}>
            {policyList.map((policy, policyIdx) => (
                <KeyValueTable<T> //
                    key={policyIdx}
                    sortedFieldkeys={getSortedFieldKeys(policy, keys_to_omit, keys_order)}
                    data={(getDisplayData(policy) || {}) as T}
                    keyLabelMapping={keyLabelMapping}
                    customComponentMapping={customComponentMapping}
                />
            ))}
        </Stack>
    );
};

export default React.memo(PolicyList) as typeof PolicyList;
