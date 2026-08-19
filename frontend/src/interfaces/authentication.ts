export interface AuthKitUser {
    user_id: string;
    username: string;
    is_temp_password: boolean;
}

export interface PreAuthFields {
    superuser_count: number;
}
