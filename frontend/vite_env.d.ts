/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REACT_APP_VERSION: string;
    readonly VITE_HOST: string;
    readonly VITE_PORT: string;
    readonly VITE_PROTOCOL: string;
    readonly VITE_MODE: string;
    readonly VITE_DISABLE_PWA_PLUGIN: string;
    readonly VITE_API_BASE_URL: string;
    readonly VITE_API_REDIRECT_BASE_URL: string;
    readonly VITE_API_TIMEOUT: string;
    readonly VITE_ENABLE_MOCK_API: string;
    readonly VITE_LOG_LEVEL: string;
    readonly VITE_ENABLE_ANALYTICS: string;
    readonly VITE_ANALYTICS_ID: string;
    readonly VITE_ENABLE_DEBUG: string;
    readonly VITE_ENABLE_SOURCE_MAPS: string;
    readonly VITE_BUILD_TARGET: string;
    readonly VITE_ENABLE_HMR: string;
    readonly VITE_ENABLE_ESLINT: string;
    readonly VITE_ENABLE_TYPE_CHECK: string;
    readonly VITE_MASTER_MITIGATION_DISABLED: string;
    readonly VITE_MASTER_REGISTER_DISABLED: string;
    readonly VITE_KB_MITRE_DISABLED: string;
    readonly VITE_KB_IM8_DISABLED: string;
    readonly VITE_KB_OWASP_REGISTER_DISABLED: string;
    readonly VITE_MASTER_ATLAS_DISABLED: string;
    readonly VITE_VIEW_PUBLIC_KB_DISABLED: string;
    readonly VITE_KB_CSA_CCOP_DISABLED: string;
    readonly VITE_KB_NIST_CSF_DISABLED: string;
    readonly VITE_KB_ISOIEC_27001_DISABLED: string;
    readonly VITE_KB_ATTACK_FLOW_DISABLED: string;
    readonly VITE_FEEDBACK_VIEWER_DISABLED: string;
    readonly VITE_VIEW_COMPLIANCE_POLICIES_DISABLED: string;
    readonly VITE_CQ_DOMAIN: string;
    readonly VITE_GOVT_MASTHEAD_DISABLED: string;
    readonly VITE_BRAND_NAME: string;
    readonly VITE_BRAND_NAME_SHORT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
