# lowest to highest
CONFIDENTIALITIY_IMPACT_LIST = [
    "option_Zx7CvBnM1qWeRtYuIoPaSd",
    "option_Lp3QwE9rTy6UiOpAsDfGh",
    "option_aK8mN4xPqR7tYuVwXz12Bc",
    "option_Mn3Kp7WsYt5Qr8VxLc1DfG",
    "option_Xt9pLm4QvR6sDn8kHy2ZaB",
]

# lowest to highest
INTEGRITY_IMPACT_LIST = [
    "option_Er2TyUiOpAsDf9GhJkLzXc",
    "option_Df7GhJkLzXcVb4NmQwErTy",
    "option_Cv5TyUiOpAsDfG6HjKlZxQ",
    "option_Bn3DfGhJkLzXcV8NmQwRtY",
    "option_Ab9KpLm4QwErTy7UiOpXsZ",
]

# lowest to highest
AVAILABILITY_IMPACT_LIST = [
    "option_Kl1ZxCvBnMqWe8RtYuIoPa",
    "option_Jk9LmNoPqRsTu5VwXyZaBc",
    "option_Hj6KlZxCvBnMq2WeRtYuIo",
    "option_Gh4JkLzXcVbNm7QwErTyUi",
    "option_Fg8HiJkLmNoPqR3StUvWxY",
]

# lowest to highest
TM_PRIORITY_LIST = [
    "tm09",
    "tm08",
    "tm03",
    "tm02",
    "tm05",
    "tm04",
    "tm07",
    "tm01",
    "tm06",
]

# lowest to highest
SYSTEM_CONFIDENTIALITY = [
    "option_Ja8fPwQLx29mRteG4HsBqN",  # gov
    "option_mK7zT2DhcwEFu1R3pVy9Lg",
    "option_qP5nXs1AE4tZk8BvHrMdCj",
    "option_Rt3eVw7YmQ2pLaK5CxNfGh",
    "option_Lb9uQk4HsE1zTg2WmPc7Yn",
    "option_Zx4dNc8JvR6mBh3QaTw5Lp",  # public
    "option_Fs6kMe2VyD9cWt7HbPg1Qr",
    "option_Pe1rTb5WqJ8yKd4NvLg2Uh",
    "option_Uh7cQm3XbN5vZa1FrJ4yPt",
    "option_Kd2zHr9LpQ6wXe8SvT3fBa",
]

# lowest to highest
SYSTEM_INTEGRITY = [
    "option_Qt7bPmX4s9FeK2uHaR3yVz",  # gov
    "option_Lk3fZt9Ns2BePw6VqD1cHr",
    "option_Sd9qMt4Bw1XpYe7CgH6vLu",
    "option_Rp2wGn6Xa8TcLv3HbM9eQf",
    "option_Wx5hCf1Tq7DbPa8KmR4yNz",
    "option_Nv8kQs3Hp5JeRm9LgT2cXy",  # public
    "option_Bs6eRf4Np1KyHd7WaJ3mZc",
    "option_Ck1yTf8Jw9MnQs4XpE6vBr",
    "option_Pa7nXg2Vy4FtLe9BsR8qMw",
    "option_Uc4dVh9Ks2FpQm8TrW1yZe",
]

# lowest to highest
SYSTEM_AVAILABILITY = [
    "option_Qb5bPnqngsAxD7NxSxTYNs",  # gov
    "option_mrzpjecWyXXyfhFQBd3Hkc",
    "option_CGcgVPw9kwYjWtcKMrVHu5",
    "option_iXJAzopnfPT6ofubirT7Lu",
    "option_MW645YEHiNGzV9jDNPkzzY",
    "option_dwuA5lhTCn3T1ReJz1D4d1",  # public
    "option_SswIUTWgudBDusl6mE9URx",
    "option_aarHL3D2tFDYLyqP2XEStY",
    "option_wnvG2V28Yx15rbcAoOd1mR",
    "option_xtxLqQtV5UJm2NXRZdTEqL",
]

INITIAL_ACCESS_SCORE_MAPPING = {"insider": 1, "outsider": 2}

DATA_ACTION_PLACEHOLDER = "<data action>"
DATA_NAME_PLACEHOLDER = "<data name>"
SYS_DESC_PLACEHOLDER = "<System Description>"
THREAT_IMPACT_PROMPT = (
    f"Given this system description below, what is the impact on the system if \
the {DATA_NAME_PLACEHOLDER} data is {DATA_ACTION_PLACEHOLDER}? {SYS_DESC_PLACEHOLDER} Summarize \
the impact in a single sentence for a threat assessment."
)

SENSITIVE_DATA = "sensitiveData"
STORED_DATA = "storedData"

EXFILTRATION = "exfiltration"
TAMPERING = "tampering"
OTHERS = "others"
DATA_ACTION = {
    EXFILTRATION: "exfiltrated",
    TAMPERING: "tampered with",
    OTHERS: "others",
}
