import {
    DEFAULT_CLUSTER_NODE_HEIGHT,
    DEFAULT_CLUSTER_NODE_WIDTH,
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
} from "#root/constants/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { svg_image_src_dict } from "#root/media/icons";

const ROOT_PARENT_ID = "1";

/** Empty space (in px) to leave around the diagram's content on every side. */
const DIAGRAM_MARGIN = 100;

/**
 * Escapes text for safe use inside an XML attribute value.
 */
const escapeXml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const iconDataUriCache = new Map<string, Promise<string>>();

const getIconDataUri = (iconKey?: string): Promise<string> => {
    const key = iconKey && iconKey in svg_image_src_dict ? iconKey : "placeholder";

    const cached = iconDataUriCache.get(key);
    if (cached) return cached;

    const promise = (async (): Promise<string> => {
        try {
            const iconUrl = svg_image_src_dict[key as keyof typeof svg_image_src_dict];
            if (typeof iconUrl !== "string") return "";

            const response = await fetch(iconUrl);
            if (!response.ok) return "";
            const svgMarkup = await response.text();

            const base64 = btoa(unescape(encodeURIComponent(svgMarkup)));
            return `data:image/svg+xml,${base64}`;
        } catch {
            return "";
        }
    })();

    iconDataUriCache.set(key, promise);
    return promise;
};

const getNodeSize = (node: DiagramNode, isCluster: boolean): { width: number; height: number } => {
    const style = (node.style ?? {}) as { width?: number | string; height?: number | string };

    const width =
        node.width ??
        node.measured?.width ??
        (typeof style.width === "number" ? style.width : undefined) ??
        (isCluster ? DEFAULT_CLUSTER_NODE_WIDTH : DEFAULT_ICON_NODE_WIDTH);
    const height =
        node.height ??
        node.measured?.height ??
        (typeof style.height === "number" ? style.height : undefined) ??
        (isCluster ? DEFAULT_CLUSTER_NODE_HEIGHT : DEFAULT_ICON_NODE_HEIGHT);

    return { width, height };
};

const sortNodesParentFirst = (nodes: DiagramNode[]): DiagramNode[] => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const sorted: DiagramNode[] = [];
    const visited = new Set<string>();

    const visit = (node: DiagramNode) => {
        if (visited.has(node.id)) return;
        visited.add(node.id);

        const parent = node.parentId ? nodeById.get(node.parentId) : undefined;
        if (parent) visit(parent);

        sorted.push(node);
    };

    nodes.forEach(visit);

    return sorted;
};

const applyDiagramMargin = (
    nodes: DiagramNode[]
): { nodes: DiagramNode[]; contentWidth: number; contentHeight: number } => {
    const topLevelNodes = nodes.filter((node) => !node.parentId);

    if (topLevelNodes.length === 0) {
        return { nodes, contentWidth: 0, contentHeight: 0 };
    }

    const bounds = topLevelNodes.reduce(
        (acc, node) => {
            const isCluster = node.type === "clusterNode";
            const { width, height } = getNodeSize(node, isCluster);
            const x = node.position?.x ?? 0;
            const y = node.position?.y ?? 0;

            return {
                minX: Math.min(acc.minX, x),
                minY: Math.min(acc.minY, y),
                maxX: Math.max(acc.maxX, x + width),
                maxY: Math.max(acc.maxY, y + height),
            };
        },
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const offsetX = DIAGRAM_MARGIN - bounds.minX;
    const offsetY = DIAGRAM_MARGIN - bounds.minY;

    const shiftedNodes =
        offsetX === 0 && offsetY === 0
            ? nodes
            : nodes.map((node) => {
                  if (node.parentId) return node;
                  return {
                      ...node,
                      position: {
                          x: (node.position?.x ?? 0) + offsetX,
                          y: (node.position?.y ?? 0) + offsetY,
                      },
                  };
              });

    return {
        nodes: shiftedNodes,
        contentWidth: bounds.maxX - bounds.minX,
        contentHeight: bounds.maxY - bounds.minY,
    };
};

const buildNodeCell = async (node: DiagramNode): Promise<string> => {
    const isCluster = node.type === "clusterNode";
    const { width, height } = getNodeSize(node, isCluster);
    const label = escapeXml((node.data?.label as string) ?? "");
    const parent = node.parentId && node.parentId.length > 0 ? node.parentId : ROOT_PARENT_ID;
    const x = node.position?.x ?? 0;
    const y = node.position?.y ?? 0;

    let style: string;
    if (isCluster) {
        style =
            "container=1;collapsible=0;rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#FFFFFF;fontColor=#FFFFFF;verticalAlign=top;align=center;fontSize=12;";
    } else {
        const iconDataUri = await getIconDataUri(node.data?.icon as string | undefined);
        style = iconDataUri
            ? // `imageAspect=1` (the default) preserves the icon's native aspect
              // ratio instead of stretching it to fill the (often non-square)
              // node bounds, matching how the icon renders on the canvas.
              `shape=image;imageAspect=1;html=1;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontColor=#FFFFFF;image=${iconDataUri};`
            : "rounded=0;whiteSpace=wrap;html=1;fontColor=#FFFFFF;strokeColor=#FFFFFF;verticalAlign=top;align=center;";
    }

    return [
        `        <mxCell id="${escapeXml(node.id)}" value="${label}" style="${style}" vertex="1" parent="${escapeXml(parent)}">`,
        `            <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />`,
        `        </mxCell>`,
    ].join("\n");
};

const buildEdgeCell = (edge: DiagramEdge): string => {
    const label = escapeXml((edge.data?.label as string) ?? "");
    const style =
        "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;strokeColor=#FFFFFF;fontColor=#FFFFFF;";

    return [
        `        <mxCell id="${escapeXml(edge.id)}" value="${label}" style="${style}" edge="1" parent="${ROOT_PARENT_ID}" source="${escapeXml(edge.source)}" target="${escapeXml(edge.target)}">`,
        `            <mxGeometry relative="1" as="geometry" />`,
        `        </mxCell>`,
    ].join("\n");
};

export const generateDrawioXml = async (
    nodes: DiagramNode[],
    edges: DiagramEdge[]
): Promise<string> => {
    const { nodes: marginedNodes, contentWidth, contentHeight } = applyDiagramMargin(nodes);
    const orderedNodes = sortNodesParentFirst(marginedNodes);
    const nodeCells = await Promise.all(orderedNodes.map(buildNodeCell));
    const edgeCells = edges.map(buildEdgeCell);

    const pageWidth = Math.max(850, Math.ceil(contentWidth + DIAGRAM_MARGIN * 2));
    const pageHeight = Math.max(1100, Math.ceil(contentHeight + DIAGRAM_MARGIN * 2));

    return [
        `<mxfile host="app.diagrams.net">`,
        `    <diagram id="architecture-canvas" name="Architecture">`,
        `        <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${pageWidth}" pageHeight="${pageHeight}" math="0" shadow="0">`,
        `            <root>`,
        `                <mxCell id="0" />`,
        `                <mxCell id="${ROOT_PARENT_ID}" parent="0" />`,
        ...nodeCells,
        ...edgeCells,
        `            </root>`,
        `        </mxGraphModel>`,
        `    </diagram>`,
        `</mxfile>`,
    ].join("\n");
};
