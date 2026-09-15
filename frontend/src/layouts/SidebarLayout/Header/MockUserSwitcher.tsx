import React from "react";

import { useNavigate } from "react-router-dom";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import { MenuItem, Select, SelectChangeEvent, Stack, Tooltip } from "@mui/material";

import { DiagramToolbarButton } from "#root/components/DiagramToolbarPrimitives";
import { useMockUsers } from "#root/hooks/useMockUsers";

const MockUserSwitcherComponent = () => {
    const navigate = useNavigate();
    const { users, currentUser, switchUser } = useMockUsers();

    const handleChange = React.useCallback(
        (event: SelectChangeEvent) => {
            const userId = event.target.value;
            switchUser(userId);
            const target = users.find((user) => user.user_id === userId);
            if (target) {
                navigate(`/?project_id=${target.project_id}`);
            }
        },
        [navigate, switchUser, users]
    );

    const handleOpenAdmin = React.useCallback(() => {
        navigate("/admin/users");
    }, [navigate]);

    if (users.length === 0) {
        return null;
    }

    return (
        <Stack
            direction="row" //
            spacing={0.5}
            sx={{ alignItems: "center" }}
        >
            <PersonIcon sx={{ color: "#fff" }} fontSize="small" />
            <Select
                value={currentUser?.user_id ?? ""}
                onChange={handleChange}
                size="small"
                variant="outlined"
                sx={{
                    color: "#fff",
                    minWidth: 140,
                    ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
                    ".MuiSvgIcon-root": { color: "#fff" },
                }}
            >
                {users.map((user) => (
                    <MenuItem
                        key={user.user_id} //
                        value={user.user_id}
                    >
                        {user.display_name}
                        {user.is_admin ? " (Admin)" : ""}
                    </MenuItem>
                ))}
            </Select>
            {!!currentUser?.is_admin && (
                <Tooltip title="Manage users & diagram quotas">
                    <DiagramToolbarButton
                        className=""
                        onClick={handleOpenAdmin}
                        size="small"
                        startIcon={<AdminPanelSettingsIcon />}
                    >
                        Admin
                    </DiagramToolbarButton>
                </Tooltip>
            )}
        </Stack>
    );
};

export default React.memo(MockUserSwitcherComponent);
