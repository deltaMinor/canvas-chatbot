import { generate } from "short-uuid";
import { v4 as uuid4 } from "uuid";

import { ShortUuidIdentifierKey, UuidIdentifierKey } from "#root/enums/app";

export const generateUUID = (
    key: UuidIdentifierKey //
) => {
    const value = `${uuid4()}`;
    if (key === UuidIdentifierKey.assessment) {
        return `assessment_${value}`;
    } else if (key === UuidIdentifierKey.diagramCanvas) {
        return `canvas_${value}`;
    } else if (key === UuidIdentifierKey.diagramEdge) {
        return `edge_${value}`;
    } else if (key === UuidIdentifierKey.diagramImage) {
        return `image_${value}`;
    } else if (key === UuidIdentifierKey.diagramLineSegment) {
        return `line_segment_${value}`;
    } else if (key === UuidIdentifierKey.diagramNode) {
        return `node_${value}`;
    } else if (key === UuidIdentifierKey.dataGridDebounce) {
        return `debounce_${value}`;
    } else if (key === UuidIdentifierKey.project) {
        return `project_${value}`;
    } else if (key === UuidIdentifierKey.resourceTag) {
        return `tag_${value}`;
    } else if (key === UuidIdentifierKey.snackbar) {
        return `snackbar_${value}`;
    } else if (key === UuidIdentifierKey.user) {
        return `user_${value}`;
    }
    return `${value}`;
};

export const generateShortUUID = (
    key: ShortUuidIdentifierKey //
) => {
    const value = `${generate()}`;
    if (key === ShortUuidIdentifierKey.diagramWarning) {
        return `warning_${value}`;
    } else if (key === ShortUuidIdentifierKey.formTextSelectable) {
        return `text_${value}`;
    } else if (key === ShortUuidIdentifierKey.formCard) {
        return `card_${value}`;
    } else if (key === ShortUuidIdentifierKey.formOption) {
        return `option_${value}`;
    } else if (key === ShortUuidIdentifierKey.mitigation) {
        return `m_${value}`;
    } else if (key === ShortUuidIdentifierKey.mitigationCustom) {
        return `m_custom_${value}`;
    } else if (key === ShortUuidIdentifierKey.tableRow) {
        return `row_${value}`;
    } else if (key === ShortUuidIdentifierKey.processItem) {
        return `process_${value}`;
    }
    return `${value}`;
};
