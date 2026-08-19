import logging
from collections import defaultdict

from shared_libs.decorators import raise_exception
from shared_libs.lib.global_shared_util import GlobalSharedUtil
from shared_libs.models.base_models import (
    AttackNarrativeStepModel,
    ContextDictObject,
    ProjectRiskScenario,
)

logger = logging.getLogger(__name__)


class BundleProcessor:
    @raise_exception(
        "Failed to initialize BundleProcessor.",
        exception_logger=logger,
    )
    def __init__(
        self,
    ):
        pass

    # =======================================================================
    # Process bundles
    # =======================================================================
    @raise_exception(
        "Failed to bundle threat scenarios.",
        exception_logger=logger,
    )
    def bundle_threat_scenarios(
        self, 
        to_bundle: list["ProjectRiskScenario"]
    ) -> list["ProjectRiskScenario"]:
        logger.info("[ RR-CORE ] Bundling threats in threat scenario view updater...")

        result: list[ProjectRiskScenario] = []
        
        if not len(to_bundle):
            return result

        mapping: dict[str, list[ProjectRiskScenario]] = defaultdict(list)

        for threat in to_bundle:
            # ranking has already been recalculated on the FE
            _id = ("-").join(threat.riskScenarioId.split("-")[:3])
            _ranking = str(threat.ranking).zfill(3)
            new_id = f"{_id}-{_ranking}"
            mapping[new_id].append(threat)

        for list_id, threat_list in mapping.items():
            context_dict = self.get_combined_context(threat_list)
            ref_threat: ProjectRiskScenario = threat_list[0]
            new_threat = ProjectRiskScenario(**ref_threat.model_dump())
            new_threat.riskScenarioId = list_id
            new_threat.keyRisk = GlobalSharedUtil.contextualize_descriptors(
                template_str=ref_threat.ref["key_risk_template"],
                context_dict=context_dict,
            )
            new_threat.riskScenario = GlobalSharedUtil.contextualize_descriptors(
                template_str=ref_threat.ref["risk_scenario_template"],
                context_dict=context_dict,
            )
            attackNarrative = AttackNarrativeStepModel(
                **ref_threat.ref["attack_narrative_template"]
            )
            attackNarrative.descriptions = [
                GlobalSharedUtil.contextualize_descriptors(
                    template_str=_, context_dict=context_dict, mode=4
                )
                for _ in attackNarrative.descriptions
            ]
            new_threat.attackNarrative = attackNarrative
            new_threat.attackPaths = [_ for t in threat_list for _ in t.attackPaths]
            new_threat.contextDict = context_dict
            result.append(new_threat)

        return result

    @raise_exception(
        "Failed to get combined context.",
        exception_logger=logger,
    )
    def get_combined_context(
        self,
        threat_list: list[ProjectRiskScenario],
    ) -> dict[str, list[str]]:
        acc: dict[str, list[ContextDictObject]] = defaultdict(list)
        for s in threat_list:
            sContextDict = s.contextDict
            if not sContextDict:
                continue
            for key, cList in sContextDict.items():
                if acc[key]:
                    curAccKeys = [i.id for i in acc[key]]
                    for obj in cList:
                        if obj.id not in curAccKeys:
                            acc[key].append(obj)
                if not acc[key]:
                    acc[key] = cList
        return acc
