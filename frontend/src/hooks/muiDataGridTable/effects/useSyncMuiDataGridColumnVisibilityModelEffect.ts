import React from "react";

import { GridColumnVisibilityModel } from "@mui/x-data-grid";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { setMuiDataGridColumnVisibilityModel } from "#root/stores/muiDataGridStore";

import {
    useMuiDataGridColumnsState,
    useMuiDataGridDefaultVisibleFields,
} from "../muiDataGridTableFeatureHooks";

export const useSyncMuiDataGridColumnVisibilityModelEffect = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const columns = useMuiDataGridColumnsState();
    const defaultVisibleFields = useMuiDataGridDefaultVisibleFields();

    const getDefaultColumnVisibilityModel = React.useCallback(() => {
        const columnKeys =
            columns
                ?.filter((column) => {
                    return !["__check__"]?.includes(column.field);
                })
                ?.map((column) => column.field) || [];

        return columnKeys.reduce(
            (model, field) => ({
                ...model,
                [field]: !!defaultVisibleFields?.includes(field),
            }),
            {} as GridColumnVisibilityModel
        );
    }, [columns, defaultVisibleFields]);

    const defaultColumnVisibilityModel = React.useMemo(
        () => getDefaultColumnVisibilityModel(),
        [getDefaultColumnVisibilityModel]
    );

    React.useEffect(() => {
        setMuiDataGridColumnVisibilityModel((prevModel) => {
            const nextModel = Object.keys(defaultColumnVisibilityModel).reduce((acc, field) => {
                acc[field] = Object.prototype.hasOwnProperty.call(prevModel, field)
                    ? !!prevModel[field]
                    : !!defaultColumnVisibilityModel[field];
                return acc;
            }, {} as GridColumnVisibilityModel);

            const prevKeys = Object.keys(prevModel);
            const nextKeys = Object.keys(nextModel);
            const hasSameKeys =
                prevKeys.length === nextKeys.length &&
                prevKeys.every((key) => Object.prototype.hasOwnProperty.call(nextModel, key));
            const hasSameValues = nextKeys.every((key) => prevModel[key] === nextModel[key]);

            if (hasSameKeys && hasSameValues) {
                return prevModel;
            }

            return nextModel;
        }, muiDataGridTableInstanceId);
    }, [defaultColumnVisibilityModel, muiDataGridTableInstanceId]);
};
