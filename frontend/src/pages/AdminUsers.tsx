import React from "react";
import { Link as RouterLink } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";

import PageHeader from "#root/components/PageHeader";
import { useMockUsers } from "#root/hooks/useMockUsers";
import { MockUser, patchMockUserQuota } from "#root/services/api/mockUsers";

const AdminUsersPageComponent = () => {
    const { users, loaded, currentUser, refresh } = useMockUsers();
    const [pendingQuotas, setPendingQuotas] = React.useState<Record<string, string>>({});
    const [savingUserId, setSavingUserId] = React.useState<string>("");

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

    if (loaded && !currentUser?.is_admin) {
        return (
            <Box className="p-3">
                <Alert severity="warning">
                    You need to be signed in as an admin mock user to manage diagram quotas. Use the
                    user switcher in the header to pick an admin user (e.g. &quot;Priya
                    Admin&quot;).
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
            <PageHeader
                title="Mock users" //
                subtitle="Every mock user is scoped to their own project, so their uploaded PDFs and generated diagram JSON stay separate. Admins can adjust each user's diagram generation quota below."
            />
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
                        {users.map((user) => (
                            <TableRow key={user.user_id}>
                                <TableCell>
                                    <Stack>
                                        <span>{user.display_name}</span>
                                        <span className="text-xs opacity-60">{user.username}</span>
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
                                        value={pendingQuotas[user.user_id] ?? user.diagram_quota}
                                        onChange={(e) =>
                                            handleQuotaInputChange(user.user_id, e.target.value)
                                        }
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        disabled={savingUserId === user.user_id}
                                        onClick={() => handleSaveQuota(user)}
                                    >
                                        Save
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
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
