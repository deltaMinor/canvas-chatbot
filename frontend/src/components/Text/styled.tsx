import { styled } from "@mui/material/styles";

export const TextWrapper = styled("span")(
    ({ theme }) => `
      display: inline-block;
      align-items: center;

      &.flexItem {
        display: inline-flex;
      }

      &.MuiText {

        &-black {
          color: ${theme.palette.common.black}
        }

        &-primary {
          color: ${theme.palette.primary.main}
        }

        &-secondary {
          color: ${theme.palette.secondary.main}
        }

        &-success {
          color: ${theme.palette.success.main}
        }

        &-warning {
          color: ${theme.palette.warning.main}
        }

        &-error {
          color: ${theme.palette.error.main}
        }

        &-info {
          color: ${theme.palette.info.main}
        }
      }
`
);
