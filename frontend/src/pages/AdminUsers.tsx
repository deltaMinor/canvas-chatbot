import React from "react";
import { Link as RouterLink } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
    Alert,
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";

import PageHeader from "#root/components/PageHeader";
import { useMockUsers } from "#root/hooks/useMockUsers";
import { MockUser, patchMockUserQuota } from "#root/services/api/mockUsers";

const AdminUsersPageComponent = () => {
    const { users, loaded, currentUser, createUser, deleteUser, refresh } = useMockUsers();
    const [pendingQuotas, setPendingQuotas] = React.useState<Record<string, string>>({});
    const [savingUserId, setSavingUserId] = React.useState<string>("");
    const [deletingUserId, setDeletingUserId] = React.useState<string>("");
    const [creating, setCreating] = React.useState(false);

    const adminCount = React.useMemo(() => users.filter((user) => user.is_admin).length, [users]);

    const handleQuotaInputChange = React.useCallback((userId: string, value: string) => {
        setPendingQuotas((prev) => ({ ...prev, [userId]: value }));
    }, []);

    const handleSaveQuota = React.useCallback(
        async (user: MockUser) => {
            const rawValue = pendingQuotas[user.user_id] ?? `${user.diagram_quota}`;
            const nextQuota = Number(rawValue);

            if (!Number.isInteger(nextQuota) || nextQuota < 0) {
                enqueueSnackbar("Diagram quota must be a non-negative whole number.", {
                    variant: "error",
                });
                return;
            }

            setSavingUserId(user.user_id);
            try {
                await patchMockUserQuota(user.user_id, nextQuota);
                enqueueSnackbar(`Updated ${user.display_name}'s diagram quota to ${nextQuota}.`, {
                    variant: "success",
                });
                await refresh();
                setPendingQuotas((prev) => {
                    const next = { ...prev };
                    delete next[user.user_id];
                    return next;
                });
            } catch (e) {
                enqueueSnackbar(`Failed to update diagram quota. ${e}`, { variant: "error" });
            } finally {
                setSavingUserId("");
            }
        },
        [pendingQuotas, refresh]
    );

    const handleAddUser = React.useCallback(async () => {
        setCreating(true);
        try {
            const newUser = await createUser();
            enqueueSnackbar(`Added ${newUser.display_name}.`, { variant: "success" });
        } catch (e) {
            enqueueSnackbar(`Failed to add user. ${e}`, { variant: "error" });
        } finally {
            setCreating(false);
        }
    }, [createUser]);

    const handleDeleteUser = React.useCallback(
        async (user: MockUser) => {
            if (
                !window.confirm(
                    `Delete ${user.display_name}? This permanently removes their project, ` +
                        "canvas, and every uploaded/generated file. This can't be undone."
                )
            ) {
                return;
            }

            setDeletingUserId(user.user_id);
            try {
                await deleteUser(user.user_id);
                enqueueSnackbar(`Deleted ${user.display_name}.`, { variant: "success" });
            } catch (e) {
                enqueueSnackbar(`Failed to delete user. ${e}`, { variant: "error" });
            } finally {
                setDeletingUserId("");
            }
        },
        [deleteUser]
    );

    if (loaded && !currentUser?.is_admin) {
        return (
            <Box className="p-3">
                <Alert severity="warning">
                    You need to be signed in as an admin mock user to manage users and diagram
                    quotas. Use the user switcher in the header to pick an admin user (e.g.
                    &quot;Priya Admin&quot;).
                </Alert>
                <Box className="pt-2">
                    <Button
                        component={RouterLink} //
                        to="/"
                        variant="outlined"
                    >
                        Back to diagram
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="flex h-full w-full flex-col overflow-auto p-2">
            <Stack
                direction="row" //
                sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            >
                <PageHeader
                    title="Mock users" //
                    subtitle="Every mock user is scoped to their own project, so their uploaded PDFs and generated diagram JSON stay separate. Add or remove users to test with more or fewer of them, and adjust each user's diagram generation quota below."
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={creating}
                    onClick={handleAddUser}
                >
                    Add user
                </Button>
            </Stack>
            <TableContainer className="mt-2">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell align="right">Diagrams generated</TableCell>
                            <TableCell align="right">Diagram quota</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => {
                            // Mirrors the backend's own guardrails (see
                            // `mock_users.delete_user`), disabled here too
                            // so the button doesn't just bounce off a 400.
                            const isLastUser = users.length <= 1;
                            const isLastAdmin = user.is_admin && adminCount <= 1;
                            const deleteDisabled =
                                isLastUser || isLastAdmin || deletingUserId === user.user_id;
                            const deleteDisabledReason = isLastUser
                                ? "Can't delete the last remaining user."
                                : isLastAdmin
                                  ? "Can't delete the last remaining admin."
                                  : "";

                            return (
                                <TableRow key={user.user_id}>
                                    <TableCell>
                                        <Stack>
                                            <span>{user.display_name}</span>
                                            <span className="text-xs opacity-60">
                                                {user.username}
                                            </span>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_admin ? (
                                            <Chip
                                                label="Admin" //
                                                color="primary"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip
                                                label="User" //
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs">{user.project_id}</span>
                                    </TableCell>
                                    <TableCell align="right">{user.diagrams_generated}</TableCell>
                                    <TableCell align="right">
                                        <TextField
                                            type="number"
                                            size="small"
                                            inputProps={{ min: 0, className: "text-right" }}
                                            sx={{ width: 90 }}
                                            value={
                                                pendingQuotas[user.user_id] ?? user.diagram_quota
                                            }
                                            onChange={(e) =>
                                                handleQuotaInputChange(user.user_id, e.target.value)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack
                                            direction="row" //
                                            spacing={0.5}
                                            sx={{ justifyContent: "flex-end" }}
                                        >
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={savingUserId === user.user_id}
                                                onClick={() => handleSaveQuota(user)}
                                            >
                                                Save
                                            </Button>
                                            <Tooltip
                                                title={deleteDisabledReason || "Delete this user"}
                                            >
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        disabled={deleteDisabled}
                                                        onClick={() => handleDeleteUser(user)}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box className="pt-2">
                <Button
                    component={RouterLink} //
                    to={`/?project_id=${currentUser?.project_id ?? ""}`}
                    variant="outlined"
                >
                    Back to diagram
                </Button>
            </Box>
        </Box>
    );
};

export default React.memo(AdminUsersPageComponent);
