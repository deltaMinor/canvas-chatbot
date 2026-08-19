import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type MuiDatePickerProps = {
    defaultValue?: string;
    disabled: boolean;
    onChange: (value: dayjs.Dayjs | null, _context: unknown) => Promise<void>;
    value?: string;
};

const MuiDatePicker = ({ ...props }: MuiDatePickerProps) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker //
                {...(props.value !== undefined
                    ? { value: dayjs(props.value || undefined) }
                    : { defaultValue: dayjs(props.defaultValue || undefined) })}
                onChange={props.onChange}
                disabled={props.disabled}
                sx={{
                    "& .MuiInputBase-root": {
                        borderRadius: "4.5px", //
                    },
                }}
            />
        </LocalizationProvider>
    );
};

export default MuiDatePicker;
