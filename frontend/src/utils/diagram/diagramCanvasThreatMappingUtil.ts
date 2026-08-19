import { CanvasType } from "#root/enums/diagram";
import { DiagramCanvas, DiagramNode } from "#root/interfaces/diagram";
import { NodeAttackPathMapping, NodeAttackPathStep } from "#root/interfaces/mitre";
import { AttackPath } from "#root/interfaces/register";

export const getNodeAttackStepCountMapping = (_nodes: DiagramNode[], canvas: DiagramCanvas[]) => {
    if (!_nodes?.length) return {} as { [key: string]: number };

    const mapping: { [key: string]: number } = {};
    const threatScenarioCanvasViews = canvas.filter(
        (view) => view.canvas_type === CanvasType.threat_scenario
    );

    threatScenarioCanvasViews.forEach((view) => {
        const viewThreatScenarios = view.ref?.threat_scenario_ref?.attackPaths;
        if (!viewThreatScenarios) return;

        const nodeIds = [
            ...new Set(viewThreatScenarios.flatMap((attackPath: AttackPath) => attackPath.nodes)),
        ] as string[];
        nodeIds.forEach((nodeId) => {
            mapping[nodeId] = (mapping[nodeId] ?? 0) + 1;
        });
    });

    return mapping;
};

export const getNodeAttackPathMapping = (_nodes: DiagramNode[], canvas: DiagramCanvas[]) => {
    const mapping = {} as {
        [key: string]: {
            [key: string]: {
                keyRisk: string;
                riskScenario: string;
                paths: string[];
                steps: NodeAttackPathStep[];
                pathDetails: {
                    pathId: string;
                    steps: NodeAttackPathStep[];
                }[];
            };
        };
    };

    const threatScenarioCanvasViews = canvas.filter(
        (view) => view.canvas_type === CanvasType.threat_scenario
    );

    threatScenarioCanvasViews.forEach((view) => {
        const threatScenarioRef = view.ref?.threat_scenario_ref;
        if (!threatScenarioRef) return;

        const keyRisk = threatScenarioRef.keyRisk || "";
        threatScenarioRef.attackPaths?.forEach((attackPath: AttackPath) => {
            const pathName = attackPath.id;
            attackPath.steps.forEach((step) => {
                const nodeMapping = mapping[step.nodeId] ?? (mapping[step.nodeId] = {});
                if (!nodeMapping[keyRisk]) {
                    nodeMapping[keyRisk] = {
                        keyRisk,
                        riskScenario: attackPath.riskScenario || "",
                        paths: [],
                        steps: [],
                        pathDetails: [],
                    };
                }

                const entry = nodeMapping[keyRisk];
                if (!entry) return;
                if (!entry.paths.includes(pathName)) {
                    entry.paths.push(pathName);
                }

                const nextStep = {
                    step: step.step,
                    techniqueId: step.techniqueId,
                    technique: step.technique,
                };
                entry.steps.push(nextStep);

                const existingPathDetail = entry.pathDetails.find(
                    (detail) => detail.pathId === pathName
                );
                if (existingPathDetail) {
                    existingPathDetail.steps.push(nextStep);
                } else {
                    entry.pathDetails.push({
                        pathId: pathName,
                        steps: [nextStep],
                    });
                }
            });
        });
    });

    const result = {} as NodeAttackPathMapping;
    Object.entries(mapping).forEach(([nodeId, nodeMapping]) => {
        result[nodeId] = Object.values(nodeMapping);
    });
    return result;
};
