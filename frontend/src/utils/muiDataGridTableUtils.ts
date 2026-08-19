import { GridSortModel } from "@mui/x-data-grid"

interface MuiDataGridInitialStateProps {
    pageSize?: number,
    sortModel?: GridSortModel
}

export const getMuiDataGridInitialState = ({pageSize = 25, sortModel=[]}: MuiDataGridInitialStateProps = {}) => {
    return {
        pagination: {
            paginationModel: { page: 0, pageSize: pageSize },
        },
        sorting: {
            sortModel: sortModel
        },
        filter: {
            filterModel: { items: [] },
        },
    }
}
