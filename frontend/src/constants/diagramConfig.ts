import { CanvasType } from "#root/interfaces/diagram";

export const diagram_grid_size_minor = 10;
export const diagram_grid_size_major = 100;
export const diagram_min_zoom = 0.1;
export const diagram_max_zoom = 10;
export const defaultViewport = { x: 0, y: 0, zoom: 1 };

export const INFO_NODE_TEXT_BLOCK_CONTAINER_OFFSET_BTM = -20;
export const INFO_NODE_BADGE_BLOCK_CONTAINER_OFFSET_TOP = -33.5;
export const HANDLE_STACK_VERTICAL_OFFSET_TOP = -10;
export const HANDLE_STACK_VERTICAL_OFFSET_BTM = -10;
export const HANDLE_STACK_VERTICAL_OFFSET_LEFT = -10;
export const HANDLE_STACK_VERTICAL_OFFSET_RIGHT = -10;

export const controlled_source_canvas_types = [CanvasType.architecture];
export const controlled_target_canvas_types = [CanvasType.data_flow];
