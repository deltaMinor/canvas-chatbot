declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VITE_REACT_APP_ENV?: "dev" | "test" | "stg" | "prod";
            REACT_APP_SCHEME?: string;
            REACT_APP_HOST?: string;
            PORT?: string;

            REACT_APP_ADMIN_API_PORT_NGINX?: string;
            VITE_REACT_APP_APPLICATION_API_URL_PREFIX?: string;
            REACT_APP_BE_SERVER_URL_PREFIX?: string;
        }
    }
}
