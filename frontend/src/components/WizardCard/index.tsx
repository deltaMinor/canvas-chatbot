import React from "react";

import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from "@mui/material";

import { CardContentItem } from "#root/interfaces/questionnaire";

interface WizardCardProps {
    title: string;
    card_contents: CardContentItem[];
    buttons: {
        handleClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
        buttonLabel: string;
        disabled: boolean;
    }[];
}

const WizardCard = ({ title, card_contents, buttons }: WizardCardProps) => {
    return (
        <Card
            variant="outlined"
            className="box-border flex w-full flex-col"
        >
            <CardContent className="flex-grow px-4 py-3">
                <Typography
                    variant="h5"
                    className="mb-1"
                    fontWeight={600}
                >
                    {title}
                </Typography>
                <Stack
                    direction="column"
                    className="pt-2"
                    spacing={1.25}
                >
                    {card_contents.map((item, idx) => (
                        <div key={`WizardContent_${idx}`}>
                            {!item.ignore_title && (
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    className="mb-0.5"
                                >
                                    {item.title}
                                </Typography>
                            )}
                            {item.type === "string" && (
                                <Typography
                                    color="text.secondary"
                                    className="whitespace-pre-line"
                                >
                                    {(item.value as string) || "-"}
                                </Typography>
                            )}
                            {item.type === "string_list" && (
                                <Typography color="text.secondary">
                                    {Array.isArray(item.value) && item.value.length
                                        ? (item.value as string[]).join(", ")
                                        : "-"}
                                </Typography>
                            )}
                            {item.type === "chips" && (
                                <Stack
                                    direction="row"
                                    gap={1}
                                    flexWrap="wrap"
                                >
                                    {Array.isArray(item.value) && item.value.length ? (
                                        (item.value as string[]).map((tag, tIdx) => (
                                            <Chip
                                                key={`WizardTag_${idx}_${tIdx}`}
                                                label={tag}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))
                                    ) : (
                                        <Chip
                                            label={item.value ?? "None"}
                                            size="small"
                                            variant={item.chipVariant ?? "outlined"}
                                            color={item.chipColor ?? "default"}
                                        />
                                    )}
                                </Stack>
                            )}
                        </div>
                    ))}
                </Stack>
            </CardContent>
            <CardActions className="flex justify-end px-2 pb-2">
                {buttons.map((b, index) => {
                    return (
                        <Button
                            key={`WizardButton_${index}`}
                            variant="outlined"
                            onClick={(ev) => b.handleClick(ev)}
                            disabled={b.disabled}
                        >
                            {b.buttonLabel}
                        </Button>
                    );
                })}
            </CardActions>
        </Card>
    );
};

export default React.memo(WizardCard);
