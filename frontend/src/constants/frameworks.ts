import {
    FrameworkCategoryEnum,
    OwaspAiEnum,
    OwaspAiKeys,
    OwaspEnum,
    OwaspKeys,
    RapidsEnum,
    RapidsKeys,
    ScanHpEnum,
    ScanHpKeys,
    StrideEnum,
    StrideKeys,
    TmFrameworkEnum,
    TmFrameworkKeys,
} from "#root/interfaces/register";

// ===========================================
// RAPIDS
// ===========================================
export const rapidsColorMapping = {
    [RapidsEnum.ransomware]: "#f43f5e",
    [RapidsEnum.applicationSystemVulnerability]: "#f97316",
    [RapidsEnum.phishing]: "#f59e0b",
    [RapidsEnum.insiderThreat]: "#8b5cf6",
    [RapidsEnum.ddos]: "#d946ef",
    [RapidsEnum.supplyChainCompromise]: "#22c55e",
};

export const rapidsLabelMapping = {
    [RapidsEnum.ransomware]: "Ransomware",
    [RapidsEnum.applicationSystemVulnerability]: "Application System Vulnerability",
    [RapidsEnum.phishing]: "Phishing",
    [RapidsEnum.insiderThreat]: "Insider Threat",
    [RapidsEnum.ddos]: "Distributed Denial-of-Service",
    [RapidsEnum.supplyChainCompromise]: "Supply Chain Compromise",
};

export const rapidsAbbrMapping = {
    [RapidsEnum.ransomware]: "R",
    [RapidsEnum.applicationSystemVulnerability]: "A",
    [RapidsEnum.phishing]: "P",
    [RapidsEnum.insiderThreat]: "I",
    [RapidsEnum.ddos]: "D",
    [RapidsEnum.supplyChainCompromise]: "S",
};

// ===========================================
// TM
// ===========================================
export const tmFrameworkColorMapping = {
    [TmFrameworkEnum.tm01]: "#22c55e",
    [TmFrameworkEnum.tm02]: "#f97316",
    [TmFrameworkEnum.tm03]: "#06b6d4",
    [TmFrameworkEnum.tm04]: "#ef4444",
    [TmFrameworkEnum.tm05]: "#3b82f6",
    [TmFrameworkEnum.tm06]: "#f59e0b",
    [TmFrameworkEnum.tm07]: "#6366f1",
    [TmFrameworkEnum.tm08]: "#8b5cf6",
    [TmFrameworkEnum.tm09]: "#f43f5e",
};

export const tmFrameworkLabelMapping = {
    [TmFrameworkEnum.tm01]: "Supply Chain Compromise",
    [TmFrameworkEnum.tm02]: "Abuse of Functionality",
    [TmFrameworkEnum.tm03]: "Network Vulnerability",
    [TmFrameworkEnum.tm04]: "Insecure Endpoints",
    [TmFrameworkEnum.tm05]: "App System Vulnerability",
    [TmFrameworkEnum.tm06]: "Misconfiguration",
    [TmFrameworkEnum.tm07]: "Improper Segregation",
    [TmFrameworkEnum.tm08]: "Virtualization Vulnerability",
    [TmFrameworkEnum.tm09]: "Physical Attack",
};

export const tmFrameworkAbbrMapping = {
    [TmFrameworkEnum.tm01]: "01",
    [TmFrameworkEnum.tm02]: "02",
    [TmFrameworkEnum.tm03]: "03",
    [TmFrameworkEnum.tm04]: "04",
    [TmFrameworkEnum.tm05]: "05",
    [TmFrameworkEnum.tm06]: "06",
    [TmFrameworkEnum.tm07]: "07",
    [TmFrameworkEnum.tm08]: "08",
    [TmFrameworkEnum.tm09]: "09",
};

// ===========================================
// STRIDE
// ===========================================
export const scanHpColorMapping = {
    [ScanHpEnum.sensor]: "#06b6d4",
    [ScanHpEnum.controller]: "#6366f1",
    [ScanHpEnum.actuator]: "#ef4444",
    [ScanHpEnum.network]: "#3b82f6",
    [ScanHpEnum.hmiProcess]: "#14b8a6",
};

export const scanHpLabelMapping = {
    [ScanHpEnum.sensor]: "Sensor",
    [ScanHpEnum.controller]: "Controller",
    [ScanHpEnum.actuator]: "Actuator",
    [ScanHpEnum.network]: "Network",
    [ScanHpEnum.hmiProcess]: "HMI Process",
};

export const scanHpAbbrMapping = {
    [ScanHpEnum.sensor]: "S",
    [ScanHpEnum.controller]: "C",
    [ScanHpEnum.actuator]: "A",
    [ScanHpEnum.network]: "N",
    [ScanHpEnum.hmiProcess]: "HP",
};

// ===========================================
// STRIDE
// ===========================================
export const strideColorMapping = {
    [StrideEnum.spoofing]: "#ef4444",
    [StrideEnum.tamperingWithData]: "#f97316",
    [StrideEnum.repudiation]: "#f59e0b",
    [StrideEnum.informationDisclosure]: "#3b82f6",
    [StrideEnum.denialOfService]: "#d946ef",
    [StrideEnum.elevationOfPrivilege]: "#8b5cf6",
    [StrideEnum.lateralMovement]: "#22c55e",
};

export const strideLabelMapping = {
    [StrideEnum.spoofing]: "Spoofing",
    [StrideEnum.tamperingWithData]: "Tampering With Data",
    [StrideEnum.repudiation]: "Repudiation",
    [StrideEnum.informationDisclosure]: "Information Disclosure",
    [StrideEnum.denialOfService]: "Denial Of Service",
    [StrideEnum.elevationOfPrivilege]: "Elevation Of Privilege",
    [StrideEnum.lateralMovement]: "Lateral Movement",
};

export const strideAbbrMapping = {
    [StrideEnum.spoofing]: "S",
    [StrideEnum.tamperingWithData]: "T",
    [StrideEnum.repudiation]: "R",
    [StrideEnum.informationDisclosure]: "I",
    [StrideEnum.denialOfService]: "D",
    [StrideEnum.elevationOfPrivilege]: "E",
    [StrideEnum.lateralMovement]: "LM",
};

// ===========================================
// OWASP
// ===========================================
export const owaspColorMapping = {
    [OwaspEnum.a01]: "#ef4444",
    [OwaspEnum.a02]: "#f59e0b",
    [OwaspEnum.a03]: "#22c55e",
    [OwaspEnum.a04]: "#14b8a6",
    [OwaspEnum.a05]: "#f97316",
    [OwaspEnum.a06]: "#3b82f6",
    [OwaspEnum.a07]: "#6366f1",
    [OwaspEnum.a08]: "#8b5cf6",
    [OwaspEnum.a09]: "#06b6d4",
    [OwaspEnum.a10]: "#d946ef",
    [OwaspEnum.a11]: "#64748b",
};

export const owaspLabelMapping = {
    [OwaspEnum.a01]: "A01:2025 Broken Access Control",
    [OwaspEnum.a02]: "A02:2025 Security Misconfiguration",
    [OwaspEnum.a03]: "A03:2025 Software Supply Chain Failures",
    [OwaspEnum.a04]: "A04:2025 Cryptographic Failures",
    [OwaspEnum.a05]: "A05:2025 Injection",
    [OwaspEnum.a06]: "A06:2025 Insecure Design",
    [OwaspEnum.a07]: "A07:2025 Authentication Failures",
    [OwaspEnum.a08]: "A08:2025 Software or Data Integrity Failures",
    [OwaspEnum.a09]: "A09:2025 Security Logging and Alerting Failures",
    [OwaspEnum.a10]: "A10:2025 Mishandling of Exceptional Conditions",
    [OwaspEnum.a11]: "System (Outside OWASP)",
};

export const owaspLinkMapping = {
    [OwaspEnum.a01]: "https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/",
    [OwaspEnum.a02]: "https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/",
    [OwaspEnum.a03]: "https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures",
    [OwaspEnum.a04]: "https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures",
    [OwaspEnum.a05]: "https://owasp.org/Top10/2025/A05_2025-Injection",
    [OwaspEnum.a06]: "https://owasp.org/Top10/2025/A06_2025-Insecure_Design",
    [OwaspEnum.a07]: "https://owasp.org/Top10/2025/A07_2025-Authentication_Failures",
    [OwaspEnum.a08]: "https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures",
    [OwaspEnum.a09]: "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures",
    [OwaspEnum.a10]: "https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions",
    [OwaspEnum.a11]: "",
};

export const owaspAbbrMapping = {
    [OwaspEnum.a01]: "A01",
    [OwaspEnum.a02]: "A02",
    [OwaspEnum.a03]: "A03",
    [OwaspEnum.a04]: "A04",
    [OwaspEnum.a05]: "A05",
    [OwaspEnum.a06]: "A06",
    [OwaspEnum.a07]: "A07",
    [OwaspEnum.a08]: "A08",
    [OwaspEnum.a09]: "A09",
    [OwaspEnum.a10]: "A10",
    [OwaspEnum.a11]: "A11",
};

// ===========================================
// OWASP AI
// ===========================================
export const owaspAiColorMapping = {
    [OwaspAiEnum.engineeringEnvironment]: "#3b82f6",
    [OwaspAiEnum.modelUse]: "#8b5cf6",
    [OwaspAiEnum.softwareChain]: "#22c55e",
    [OwaspAiEnum.breakIntoDeployedModel]: "#ef4444",
};

export const owaspAiLabelMapping = {
    [OwaspAiEnum.engineeringEnvironment]: "Engineering Environment",
    [OwaspAiEnum.modelUse]: "Model Use",
    [OwaspAiEnum.softwareChain]: "Software Chain",
    [OwaspAiEnum.breakIntoDeployedModel]: "Break Into Deployed Model",
};

export const owaspAiAbbrMapping = {
    [OwaspAiEnum.engineeringEnvironment]: "EE",
    [OwaspAiEnum.modelUse]: "MU",
    [OwaspAiEnum.softwareChain]: "SC",
    [OwaspAiEnum.breakIntoDeployedModel]: "DM",
};

// ===========================================
// Threat Modeling Frameworks
// ===========================================
export const FrameworkCategoryLabel = {
    [FrameworkCategoryEnum.owasp]: "OWASP Top 10 2025",
    [FrameworkCategoryEnum.owaspAi]: "OWASP AI",
    [FrameworkCategoryEnum.rapids]: "RAPIDS",
    [FrameworkCategoryEnum.scanHp]: "SCAN-HP",
    [FrameworkCategoryEnum.stride]: "STRIDE-LM",
    [FrameworkCategoryEnum.tm]: "ThreatMirror",
};

export const FrameworkMapping = {
    [FrameworkCategoryEnum.owasp]: {
        keys: OwaspKeys,
        label: owaspLabelMapping,
        color: owaspColorMapping,
        abbr: owaspAbbrMapping,
        link: owaspLinkMapping,
    },
    [FrameworkCategoryEnum.owaspAi]: {
        keys: OwaspAiKeys,
        label: owaspAiLabelMapping,
        color: owaspAiColorMapping,
        abbr: owaspAiAbbrMapping,
        link: {},
    },
    [FrameworkCategoryEnum.rapids]: {
        keys: RapidsKeys,
        label: rapidsLabelMapping,
        color: rapidsColorMapping,
        abbr: rapidsAbbrMapping,
        link: {},
    },
    [FrameworkCategoryEnum.scanHp]: {
        keys: ScanHpKeys,
        label: scanHpLabelMapping,
        color: scanHpColorMapping,
        abbr: scanHpAbbrMapping,
        link: {},
    },
    [FrameworkCategoryEnum.stride]: {
        keys: StrideKeys,
        label: strideLabelMapping,
        color: strideColorMapping,
        abbr: strideAbbrMapping,
        link: {},
    },
    [FrameworkCategoryEnum.tm]: {
        keys: TmFrameworkKeys,
        label: tmFrameworkLabelMapping,
        color: tmFrameworkColorMapping,
        abbr: tmFrameworkAbbrMapping,
        link: {},
    },
};
