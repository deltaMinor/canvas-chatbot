import React from "react";

import {
    MOCK_USER_CHANGED_EVENT,
    getStoredMockUserId,
    setStoredMockUser,
} from "#root/lib/mockUser";
import {
    MockUser,
    createMockUser,
    deleteMockUser,
    getMockUsers,
} from "#root/services/api/mockUsers";

export const useMockUsers = () => {
    const [users, setUsers] = React.useState<MockUser[]>([]);
    const [loaded, setLoaded] = React.useState(false);
    const [currentUserId, setCurrentUserId] = React.useState(getStoredMockUserId());

    const refresh = React.useCallback(async () => {
        try {
            const res = await getMockUsers();
            const fetchedUsers = res.data.data.users ?? [];
            setUsers(fetchedUsers);
            return fetchedUsers;
        } finally {
            setLoaded(true);
        }
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    React.useEffect(() => {
        const handleChange = () => setCurrentUserId(getStoredMockUserId());
        window.addEventListener(MOCK_USER_CHANGED_EVENT, handleChange);
        window.addEventListener("storage", handleChange);
        return () => {
            window.removeEventListener(MOCK_USER_CHANGED_EVENT, handleChange);
            window.removeEventListener("storage", handleChange);
        };
    }, []);

    React.useEffect(() => {
        if (!loaded || users.length === 0) return;
        if (currentUserId && users.some((user) => user.user_id === currentUserId)) return;

        const defaultUser = users.find((user) => !user.is_admin) ?? users[0];
        setStoredMockUser(defaultUser.user_id, defaultUser.project_id);
        setCurrentUserId(defaultUser.user_id);
    }, [loaded, currentUserId, users]);

    const currentUser = React.useMemo(
        () => users.find((user) => user.user_id === currentUserId),
        [users, currentUserId]
    );

    const switchUser = React.useCallback(
        (userId: string) => {
            const target = users.find((user) => user.user_id === userId);
            if (!target) return;
            setStoredMockUser(target.user_id, target.project_id);
            setCurrentUserId(target.user_id);
        },
        [users]
    );

    const createUser = React.useCallback(async () => {
        const res = await createMockUser();
        const newUser = res.data.data.user;
        await refresh();
        return newUser;
    }, [refresh]);

    const deleteUser = React.useCallback(
        async (userId: string) => {
            await deleteMockUser(userId);
            await refresh();
        },
        [refresh]
    );

    return { users, loaded, currentUser, switchUser, createUser, deleteUser, refresh };
};
