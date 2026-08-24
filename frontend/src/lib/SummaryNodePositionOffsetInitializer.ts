import {
    SUMMARY_DEVICE_NODE_HEIGHT,
    SUMMARY_DEVICE_NODE_OFFSET_X,
    SUMMARY_DEVICE_NODE_OFFSET_Y,
    SUMMARY_DEVICE_NODE_SPACING_X,
    SUMMARY_DEVICE_NODE_SPACING_Y,
    SUMMARY_DEVICE_NODE_WIDTH,
    SUMMARY_NODE_COLUMN_SPACING_X,
    SUMMARY_NODE_COLUMN_SPACING_Y,
    SUMMARY_USER_NODE_OFFSET_X,
    SUMMARY_USER_NODE_OFFSET_Y,
    SUMMARY_USER_NODE_SPACING_X,
    SUMMARY_USER_NODE_SPACING_Y,
    SUMMARY_USER_NODE_WIDTH,
} from "#root/constants/diagram";
import { SummaryCanvasColumn, SummaryCanvasColumnPositionAttr } from "#root/interfaces/diagram";

export class SummaryNodePositionOffsetInitializer {
    extremeBottomY: number;
    extremeLeftX: number;
    extremeRightX: number;
    extremeTopY: number;

    constructor({
        extremeBottomY,
        extremeLeftX,
        extremeRightX,
        extremeTopY,
    }: {
        extremeBottomY: number;
        extremeLeftX: number;
        extremeRightX: number;
        extremeTopY: number;
    }) {
        this.extremeBottomY = extremeBottomY;
        this.extremeLeftX = extremeLeftX;
        this.extremeRightX = extremeRightX;
        this.extremeTopY = extremeTopY;
    }
    getInitPositionOffset() {
        return {
            left: {
                defaultX: this.extremeLeftX, //
                defaultY: this.extremeTopY,
                x: this.extremeLeftX, //
                y: this.extremeTopY,
                incrementOffsetRelative: {
                    device: ({ height }) => ({
                        x: -1 * SUMMARY_DEVICE_NODE_OFFSET_X,
                        y: 1 * (height + SUMMARY_DEVICE_NODE_SPACING_Y),
                    }),
                    user: ({ height }) => ({
                        x: -1 * SUMMARY_USER_NODE_OFFSET_X,
                        y: 1 * (height + SUMMARY_USER_NODE_SPACING_Y),
                    }),
                    interface: () => ({
                        x: 0,
                        y: 0,
                    }),
                },
                columnOffsetRelative: {
                    device: {
                        x: -1 * (SUMMARY_NODE_COLUMN_SPACING_X + SUMMARY_DEVICE_NODE_WIDTH),
                        y: 0,
                    },
                    user: {
                        x: -1 * (SUMMARY_NODE_COLUMN_SPACING_X + SUMMARY_USER_NODE_WIDTH),
                        y: 0,
                    },
                    interface: {
                        x: 0,
                        y: 0,
                    },
                },
                columnOffsetAbsolute: {
                    device: {
                        y: this.extremeTopY,
                    },
                    user: {
                        y: this.extremeTopY,
                    },
                    interface: {
                        y: this.extremeTopY,
                    },
                },
            },
            right: {
                defaultX: this.extremeRightX, //
                defaultY: this.extremeTopY,
                x: this.extremeRightX,
                y: this.extremeTopY,
                incrementOffsetRelative: {
                    device: ({ height }) => ({
                        x: 1 * SUMMARY_DEVICE_NODE_OFFSET_X,
                        y: 1 * (height + SUMMARY_DEVICE_NODE_SPACING_Y),
                    }),
                    user: ({ height }) => ({
                        x: 1 * SUMMARY_USER_NODE_OFFSET_X,
                        y: 1 * (height + SUMMARY_USER_NODE_SPACING_Y),
                    }),
                    interface: () => ({
                        x: 0,
                        y: 0,
                    }),
                },
                columnOffsetRelative: {
                    device: {
                        x: SUMMARY_NODE_COLUMN_SPACING_X,
                        y: 0,
                    },
                    user: {
                        x: SUMMARY_NODE_COLUMN_SPACING_X + SUMMARY_DEVICE_NODE_WIDTH,
                        y: 0,
                    },
                    interface: {
                        x: 0,
                        y: 0,
                    },
                },
                columnOffsetAbsolute: {
                    device: {
                        y: this.extremeTopY,
                    },
                    user: {
                        y: this.extremeTopY,
                    },
                    interface: {
                        y: this.extremeTopY,
                    },
                },
            },
            top: {
                defaultX: this.extremeLeftX, //
                defaultY: this.extremeTopY,
                x: this.extremeLeftX, //
                y: this.extremeTopY,
                incrementOffsetRelative: {
                    device: ({ width }) => ({
                        x: 1 * (width + SUMMARY_DEVICE_NODE_SPACING_X),
                        y: -1 * SUMMARY_DEVICE_NODE_OFFSET_Y,
                    }),
                    user: ({ width }) => ({
                        x: 1 * (width + SUMMARY_USER_NODE_SPACING_X),
                        y: -1 * SUMMARY_USER_NODE_OFFSET_Y,
                    }),
                    interface: () => ({
                        x: 0,
                        y: 0,
                    }),
                },
                columnOffsetRelative: {
                    device: {
                        x: 0,
                        y: -1 * (SUMMARY_NODE_COLUMN_SPACING_Y + SUMMARY_DEVICE_NODE_HEIGHT),
                    },
                    user: {
                        x: 0,
                        y: -1 * SUMMARY_NODE_COLUMN_SPACING_Y,
                        // SUMMARY_USER_NODE_HEIGHT
                    },
                    interface: {
                        x: 0,
                        y: 0,
                    },
                },
                columnOffsetAbsolute: {
                    device: {
                        x: this.extremeLeftX,
                    },
                    user: {
                        x: this.extremeLeftX,
                    },
                    interface: {
                        x: this.extremeLeftX,
                    },
                },
            },
            bottom: {
                defaultX: this.extremeLeftX, //
                defaultY: this.extremeBottomY,
                x: this.extremeLeftX, //
                y: this.extremeBottomY,
                incrementOffsetRelative: {
                    device: ({ width }) => ({
                        x: 1 * (width + SUMMARY_DEVICE_NODE_SPACING_X),
                        y: 1 * SUMMARY_DEVICE_NODE_OFFSET_Y,
                    }),
                    user: ({ width }) => ({
                        x: 1 * (width + SUMMARY_USER_NODE_SPACING_X),
                        y: 1 * SUMMARY_USER_NODE_OFFSET_Y,
                    }),
                    interface: () => ({
                        x: 0,
                        y: 0,
                    }),
                },
                columnOffsetRelative: {
                    device: {
                        x: 0,
                        y: 1 * SUMMARY_NODE_COLUMN_SPACING_Y,
                    },
                    user: {
                        x: 0,
                        y: 1 * SUMMARY_NODE_COLUMN_SPACING_Y,
                    },
                    interface: {
                        x: 0,
                        y: 0,
                    },
                },
                columnOffsetAbsolute: {
                    device: {
                        x: this.extremeLeftX,
                    },
                    user: {
                        x: this.extremeLeftX,
                    },
                    interface: {
                        x: this.extremeLeftX,
                    },
                },
            },
        } as {
            [key in SummaryCanvasColumn]: SummaryCanvasColumnPositionAttr;
        };
    }
}
