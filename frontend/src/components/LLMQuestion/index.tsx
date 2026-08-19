import React from "react";

import { Typography } from "@mui/material";

const LLMQuestionRoot = ({ children }: { children?: React.ReactNode }) => {
    return <>{children}</>;
};

const QuestionLabel = ({
    question, //
}: {
    question: string;
}) => {
    return (
        <Typography //
            sx={{ marginBottom: "2px", fontWeight: 500 }}
        >
            {question}
        </Typography>
    );
};

const LLMQuestion = Object.assign(React.memo(LLMQuestionRoot), {
    QuestionLabel: React.memo(QuestionLabel),
});

export default LLMQuestion;
