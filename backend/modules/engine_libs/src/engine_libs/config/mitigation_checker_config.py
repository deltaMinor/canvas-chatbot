"""Configuration constants for MitigationQualityChecker."""

from __future__ import annotations

import re

#: Regex that matches a canonical MITRE ATT&CK mitigation ID (M####).
MITIGATION_ID_PATTERN: re.Pattern[str] = re.compile(r"^M\d{4}$")
