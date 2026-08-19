"""Threat-framework definitions.

Tuple layout for each entry in ``FRAMEWORK_ORDER``::

    (settings_attr, label, instruction, json_key, def_suffix)

    settings_attr  — attribute name on ``DisplayFrameworksSettings`` that
                     gates whether this framework is enabled for a project.
    label          — human-readable name shown in questionnaire dropdowns and
                     LLM prompt headers (e.g. "STRIDE-LM category").
    instruction    — directive injected into the LLM prompt when the framework
                     is active (e.g. "Assign exactly ONE primary … category").
    json_key       — key used inside the LLM JSON result schema.
    def_suffix     — suffix appended to "threat_attributes_<def_suffix>_def"
                     to build the ``FRAMEWORK_DEF_KEYS`` lookup key.
"""

from __future__ import annotations

#: Ordered list of supported threat frameworks.  Order governs the sequence
#: in which framework instructions appear in LLM prompts and dropdowns.
FRAMEWORK_ORDER: tuple[tuple[str, str, str, str, str], ...] = (
    (
        "stride",
        "STRIDE-LM",
        "Assign all relevant STRIDE categories (one or more, ordered by relevance).",
        "stride",
        "stride",
    ),
    (
        "owasp",
        "OWASP Top 10 2025",
        "Assign all relevant OWASP Top 10 categories (one or more, ordered by relevance).",
        "owasp",
        "owasp",
    ),
    (
        "tm",
        "ThreatMirror",
        "Assign all relevant ThreatMirror categories (one or more, ordered by relevance).",
        "threat_mirror",
        "tm",
    ),
    (
        "scanHp",
        "SCAN-HP",
        "Assign all relevant SCAN-HP categories (one or more, ordered by relevance).",
        "scan_hp",
        "scanhp",
    ),
    (
        "rapids",
        "RAPIDS",
        "Assign all relevant RAPIDS categories (one or more, ordered by relevance).",
        "rapids",
        "rapids",
    ),
    (
        "owaspAi",
        "OWASP AI",
        "Assign all relevant OWASP AI categories (one or more, ordered by relevance).",
        "owasp_ai",
        "owaspai",
    ),
)

#: Maps prompt-template placeholder keys to their ``DisplayFrameworksSettings``
#: attribute.  Used by ``LLMUtil.get_prompt_template`` to skip framework-
#: specific template lines when a framework is disabled for the project.
#: Key format: ``"threat_attributes_<def_suffix>_def"``.
FRAMEWORK_DEF_KEYS: dict[str, str] = {
    f"threat_attributes_{def_suffix}_def": settings_attr
    for settings_attr, _, _, _, def_suffix in FRAMEWORK_ORDER
}

#: Maps each framework's display labels (as the LLM returns them) to their
#: canonical enum keys stored in the database.  Multiple aliases are accepted
#: per value so that minor LLM phrasing variations are tolerated.
#: Used by ``LLMThreatAttributesUtil.validate_framework_labels``.
FRAMEWORK_LABEL_TO_ENUM: dict[str, dict[str, str]] = {
    "stride": {
        "Spoofing": "spoofing",
        "Tampering": "tamperingWithData",
        "Tampering With Data": "tamperingWithData",
        "Tampering with Data": "tamperingWithData",
        "Repudiation": "repudiation",
        "Information Disclosure": "informationDisclosure",
        "Denial of Service": "denialOfService",
        "Denial Of Service": "denialOfService",
        "Elevation of Privilege": "elevationOfPrivilege",
        "Elevation Of Privilege": "elevationOfPrivilege",
        "Lateral Movement": "lateralMovement",
    },
    "owasp": {
        "A01:2025 Broken Access Control": "a01",
        "A01": "a01",
        "Broken Access Control": "a01",
        "A02:2025 Security Misconfiguration": "a02",
        "A02": "a02",
        "Security Misconfiguration": "a02",
        "A03:2025 Software Supply Chain Failures": "a03",
        "A03": "a03",
        "Software Supply Chain Failures": "a03",
        "A04:2025 Cryptographic Failures": "a04",
        "A04": "a04",
        "Cryptographic Failures": "a04",
        "A05:2025 Injection": "a05",
        "A05": "a05",
        "Injection": "a05",
        "A06:2025 Insecure Design": "a06",
        "A06": "a06",
        "Insecure Design": "a06",
        "A07:2025 Authentication Failures": "a07",
        "A07": "a07",
        "Authentication Failures": "a07",
        "A08:2025 Software or Data Integrity Failures": "a08",
        "A08": "a08",
        "Software or Data Integrity Failures": "a08",
        "A09:2025 Security Logging and Alerting Failures": "a09",
        "A09": "a09",
        "Security Logging and Alerting Failures": "a09",
        "A10:2025 Mishandling of Exceptional Conditions": "a10",
        "A10": "a10",
        "Mishandling of Exceptional Conditions": "a10",
        "A11:2025 System (Outside OWASP jurisdiction)": "a11",
        "A11": "a11",
        "System (Outside OWASP)": "a11",
        "System (Outside OWASP jurisdiction)": "a11",
    },
    "tm": {
        "01 Supply Chain Compromise": "tm01",
        "tm01": "tm01",
        "01": "tm01",
        "Supply Chain Compromise": "tm01",
        "02 Abuse of Functionality": "tm02",
        "tm02": "tm02",
        "02": "tm02",
        "Abuse of Functionality": "tm02",
        "03 Network Vulnerability": "tm03",
        "tm03": "tm03",
        "03": "tm03",
        "Network Vulnerability": "tm03",
        "04 Insecure Endpoints": "tm04",
        "tm04": "tm04",
        "04": "tm04",
        "Insecure Endpoints": "tm04",
        "05 App System Vulnerability": "tm05",
        "tm05": "tm05",
        "05": "tm05",
        "App System Vulnerability": "tm05",
        "06 Misconfiguration": "tm06",
        "tm06": "tm06",
        "06": "tm06",
        "Misconfiguration": "tm06",
        "07 Improper Segregation": "tm07",
        "tm07": "tm07",
        "07": "tm07",
        "Improper Segregation": "tm07",
        "08 Virtualization Vulnerability": "tm08",
        "tm08": "tm08",
        "08": "tm08",
        "Virtualization Vulnerability": "tm08",
    },
    "scanHp": {
        "S Sensor": "sensor",
        "S": "sensor",
        "Sensor": "sensor",
        "C Controller": "controller",
        "C": "controller",
        "Controller": "controller",
        "A Actuator": "actuator",
        "A": "actuator",
        "Actuator": "actuator",
        "N Network": "network",
        "N": "network",
        "Network": "network",
        "H HMI": "hmiProcess",
        "H": "hmiProcess",
        "HMI": "hmiProcess",
        "P Process": "hmiProcess",
        "P": "hmiProcess",
        "Process": "hmiProcess",
        "HMI Process": "hmiProcess",
    },
    "rapids": {
        "R Ransomware": "ransomware",
        "R": "ransomware",
        "Ransomware": "ransomware",
        "A App System Vulnerability": "applicationSystemVulnerability",
        "A": "applicationSystemVulnerability",
        "App System Vulnerability": "applicationSystemVulnerability",
        "Application System Vulnerability": "applicationSystemVulnerability",
        "P Phishing": "phishing",
        "P": "phishing",
        "Phishing": "phishing",
        "I Insider": "insiderThreat",
        "I": "insiderThreat",
        "Insider": "insiderThreat",
        "Insider Threat": "insiderThreat",
        "D Denial of Service": "ddos",
        "D": "ddos",
        "Denial of Service": "ddos",
        "Distributed Denial-of-Service": "ddos",
        "S Supply Chain Compromise": "supplyChainCompromise",
        "S": "supplyChainCompromise",
        "Supply Chain Compromise": "supplyChainCompromise",
    },
    "owaspAi": {
        "B Break into Deployed Model": "breakIntoDeployedModel",
        "B": "breakIntoDeployedModel",
        "Break into Deployed Model": "breakIntoDeployedModel",
        "Break Into Deployed Model": "breakIntoDeployedModel",
        "E Engineering Environment": "engineeringEnvironment",
        "E": "engineeringEnvironment",
        "Engineering Environment": "engineeringEnvironment",
        "S Software Chain": "softwareChain",
        "S": "softwareChain",
        "Software Chain": "softwareChain",
        "M Model Use": "modelUse",
        "M": "modelUse",
        "Model Use": "modelUse",
    },
}
