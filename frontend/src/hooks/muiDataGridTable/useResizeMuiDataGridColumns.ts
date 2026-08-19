import React from "react";

import { GridAutosizeOptions, GridColDef } from "@mui/x-data-grid";

import { DEFAULT_AUTOSIZE_OPTIONS } from "#root/components/MuiDataGridTable/MuiDataGrid/constants";
import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { MuiDataGridTableRefObject } from "#root/interfaces/muiDataGridTable";
import {
    getMuiDataGridColumnsFromStore,
    getMuiDataGridDataGridPropsFromStore,
} from "#root/stores/muiDataGridStore";

const waitForNextAnimationFrame = () =>
    new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
    });

export const useResizeMuiDataGridColumns = ({
    apiRef,
}: {
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
}) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return React.useCallback(
        async (
            __autosizeOptions: GridAutosizeOptions = {} //
        ) => {
            const currentApiRef = apiRef.current;
            if (!currentApiRef) {
                return;
            }
            const rootElement = currentApiRef.rootElementRef?.current;
            if (!rootElement) {
                return;
            }

            const columns = getMuiDataGridColumnsFromStore(muiDataGridTableInstanceId);
            const dataGridProps = getMuiDataGridDataGridPropsFromStore(muiDataGridTableInstanceId);
            const dataGrid__autosizeOptions =
                (dataGridProps.autosizeOptions as GridAutosizeOptions | undefined) ?? {};
            const _autosizeOptions = {
                ...DEFAULT_AUTOSIZE_OPTIONS, //
                ...dataGrid__autosizeOptions, //
            };

            const hasFlexColumns = columns?.some((c: GridColDef) => !!c?.flex);
            const nonFlexColumns =
                columns
                    ?.filter((c: GridColDef) => {
                        return !c?.flex;
                    })
                    ?.map((c: GridColDef) => c.field) || [];
            const ___autosizeOptions = {
                ..._autosizeOptions, //
                ...(_autosizeOptions?.expand === undefined &&
                    __autosizeOptions?.expand === undefined && {
                        expand: !hasFlexColumns,
                    }),
                columns: nonFlexColumns,
                ...__autosizeOptions,
            };
            if (!___autosizeOptions.columns?.length) {
                return;
            }

            await waitForNextAnimationFrame();
            if (!currentApiRef.rootElementRef?.current) {
                return;
            }

            try {
                await currentApiRef.autosizeColumns?.(___autosizeOptions);
            } catch {
                // The grid can unmount or rebuild column headers while autosize is queued.
            }
        },
        [apiRef, muiDataGridTableInstanceId]
    );
};
