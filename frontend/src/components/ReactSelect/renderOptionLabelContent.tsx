import { Box, Stack } from "@mui/material";

import { OptionLabel } from "#root/interfaces";

// Tags like "mode__bedrock" carry a machine-readable prefix before "__" that
// isn't meant for display — only show the part after it.
const formatTagLabel = (tag: string) => tag.split("__").pop();

// Different raw tags (e.g. legacy "mode__bedrock" vs the execution-mode tag
// "bedrock" stamped on by the backend) can format to the same display label —
// collapse those to a single chip while leaving the underlying tags untouched.
const getUniqueDisplayTags = (tags: string[] = []) => {
    const seen = new Set<string>();
    const uniqueTags: string[] = [];
    tags.forEach((tag) => {
        const displayLabel = (formatTagLabel(tag) || "").toLowerCase();
        if (seen.has(displayLabel)) return;
        seen.add(displayLabel);
        uniqueTags.push(tag);
    });
    return uniqueTags;
};

export const renderOptionLabelContent = (option: OptionLabel, showTags: boolean) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                gap: 1,
            }}
        >
            <Stack
                direction="row"
                spacing={0.8}
                alignItems="flex-start"
                sx={{ minWidth: 0, flex: 1 }}
            >
                {!!option.startIcon && (
                    <Box
                        sx={(theme) => ({
                            minWidth: 24,
                            height: 24,
                            px: 0.7,
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            lineHeight: 1,
                            color: theme.colors.primary.dark,
                            backgroundColor: theme.colors.primary.lighter,
                            flexShrink: 0,
                            alignSelf: "flex-start",
                        })}
                    >
                        {option.startIcon}
                    </Box>
                )}
                <Box sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {option.label}
                </Box>
                {!!option.endIcon && (
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "flex-start",
                            flexShrink: 0,
                            alignSelf: "flex-start",
                        }}
                    >
                        {option.endIcon}
                    </Box>
                )}
            </Stack>
            {showTags && !!option.tags?.length && (
                <Stack
                    direction="row"
                    gap={0.5}
                >
                    {getUniqueDisplayTags(option.tags).map((tag, tagKey) => {
                        return (
                            <Box
                                key={`opt-tag-key-${tagKey}`}
                                sx={{
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: "999px",
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    color: "#FFFFFF",
                                    backgroundColor: "#000000",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {tag}
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};
