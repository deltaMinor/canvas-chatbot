import { Box, Typography } from "@mui/material";

import NodeIcon from "#root/components/NodeIcon";
import { DiagramNode } from "#root/interfaces/diagram";

import { SecondaryNodeContainer, StyledNodeItem } from "./styled";

export type SummaryNodeItemProps = {
    nodes: {
        node: DiagramNode;
        secondary: DiagramNode[];
    }[];
};

const NodeItemComponent = ({
    node,
    isSecondary = false,
}: {
    node: DiagramNode;
    isSecondary?: boolean;
}) => {
    return (
        <StyledNodeItem
            direction="row"
            alignItems="center"
            gap={1.25}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <NodeIcon
                    style={{
                        width: isSecondary ? "20px" : "24px",
                        height: isSecondary ? "20px" : "24px",
                        cursor: "not-allowed",
                        opacity: isSecondary ? 0.8 : 1,
                    }}
                    name={node.data.icon || ""}
                />
            </Box>
            <Typography
                sx={{
                    fontSize: isSecondary ? "0.8125rem" : "0.875rem",
                    color: isSecondary ? "text.secondary" : "text.primary",
                    fontWeight: isSecondary ? 400 : 500,
                    lineHeight: 1.5,
                }}
            >
                {node.data.label}
            </Typography>
        </StyledNodeItem>
    );
};

const SummaryNodeItem = ({ nodes }: SummaryNodeItemProps) => {
    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
            }}
        >
            {nodes.map((node, idx) => (
                <Box
                    key={`node-${idx}`}
                    sx={{
                        marginBottom: idx < nodes.length - 1 ? 1 : 0,
                    }}
                >
                    <NodeItemComponent node={node.node} />
                    {!!node.secondary.length && (
                        <SecondaryNodeContainer>
                            {node.secondary.map((snode, sIdx) => (
                                <Box
                                    key={`snode-${sIdx}`}
                                    sx={{
                                        marginBottom: sIdx < node.secondary.length - 1 ? 0.5 : 0,
                                    }}
                                >
                                    <NodeItemComponent
                                        node={snode}
                                        isSecondary={true}
                                    />
                                </Box>
                            ))}
                        </SecondaryNodeContainer>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default SummaryNodeItem;
