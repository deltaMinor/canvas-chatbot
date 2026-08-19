import React from "react";

import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import { Button, Grid } from "@mui/material";
import PropTypes from "prop-types";

interface PageTitleProps {
    heading?: string;
    subHeading?: string;
    docs?: string;
    addButton?: boolean;
    children?: React.ReactNode;
}

const PageTitle = ({
    heading = "",
    // subHeading = "",
    docs = "",
    addButton = false,
    children,
    ...props
}: PageTitleProps) => {
    return (
        <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            {...props}
        >
            {children}
            {addButton && (
                <Grid>
                    <Button
                        href={docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: { xs: 2, md: 0 } }}
                        variant="contained"
                        startIcon={<AddTwoToneIcon fontSize="small" />}
                    >
                        {heading} Documentation
                    </Button>
                </Grid>
            )}
        </Grid>
    );
};

PageTitle.propTypes = {
    heading: PropTypes.string,
    subHeading: PropTypes.string,
    docs: PropTypes.string,
};

export default React.memo(PageTitle);
