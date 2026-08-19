import { deepOrange, red } from "@mui/material/colors";

export const getAvatarBackgroundColor = (value: number) => {
    if (value < 3) {
        return deepOrange[200];
    }
    if (value >= 3 && value < 6) {
        return deepOrange[400];
    }
    if (value >= 6 && value < 9) {
        return red[700];
    }
    if (value >= 9) {
        return red[800];
    }
    return deepOrange[200];
};
