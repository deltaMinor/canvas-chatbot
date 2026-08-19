# STIX 2.1
from typing import Annotated, Any, Literal, Optional

from pydantic import BaseModel, Field

from shared_libs.models.base_models.shared.attack import (
    AttackAction,
    AttackFlowRuleExplanation,
    AttackNarrativeStepModel,
    KeyRiskTemplateRule,
    PackageGenerationCondition,
)
from shared_libs.models.base_models.shared.mitigation import MeasuresContext
from shared_libs.models.base_models.shared.register import ThreatFrameworks
from shared_libs.types.enum import (
    StixExtensionType,
    StixObjectType,
    StixOperatorType,
    StixScopeType,
)

__all__ = [
    "OpenVocab",
    "Lang",
    "Identifier",
    "MappingIdentifier",
    "IdentityIdentifier",
    "ProcessIdentifier",
    "MarkingDefinitionIdentifier",
    "ExtensionDefinitionIdentifier",
    "BundleIdentifier",
    "StartRefIdentifier",
    "EffectRefIdentifier",
    "ObjectRefIdentifier",
    "AttackActionIdentifier",
    "AttackAssetIdentifier",
    "AttackConditionIdentifier",
    "AttackFlowIdentifier",
    "AttackOperatorIdentifier",
    "AttackPatternIdentifier",
    "StixExternalReference",
    "StixGranularMarkingModel",
    "StixMetapathParameter",
    "StixConditionMetapathSingle",
    "StixConditionSingle",
    "StixGenerationConditionSingle",
    "StixExtension",
    "StixSDOModel",
    "StixSROModel",
    "StixSCOModel",
    "StixKillChainPhase",
    "StixAttackAction",
    "StixAttackAsset",
    "StixAttackCondition",
    "StixAttackFlow",
    "StixAttackOperator",
    "StixAttackPattern",
    "StixExtensionDefinition",
    "StixAttackFlowMapping",
    "StixIdentity",
    "StixSDOModels",
    "StixBundle",
]

"""
STIX 2.1 Glossary

AV - Anti-Virus / Anti-Malware solution
CAPEC - Common Attack Pattern Enumeration and Classification
Consumer - Any entity that receives STIX content
CTI - Cyber Threat Intelligence
Deprecated - STIX features or properties that are in the process of being
replaced by newer ones.
Embedded Relationship - A link (an "edge" in a graph) between one STIX Object
and another represented as a property on one object containing the ID of
another object
Entity - Anything that has a separately identifiable existence (e.g.,
organization, person, group, etc.)
IEP - FIRST (Forum of Incident Response and Security Teams) Information
Exchange Policy
Instance - A single occurrence of a STIX Object version
MTI - Mandatory To Implement
Object Creator - The entity that created or updated a STIX Object (see section
3.5)
Object Representation - An instance of an object version that is serialized as
STIX
Producer - Any entity that distributes STIX content, including object creators
as well as those passing along existing content
SCO - STIX Cyber-observable Object
SDO - STIX Domain Object (a "node" in a graph)
SMO - STIX Meta Object
SRO - STIX Relationship Object (one mechanism to represent an "edge" in a
graph)
STIX - Structured Threat Information Expression
STIX Content - STIX documents, including STIX Objects, STIX Objects grouped as
flows, etc.
STIX Object - A STIX Domain Object (SDO), STIX Cyber Observable Object (SCO),
STIX Relationship Object (SRO), or STIX Meta Object (SMO).
STIX Relationship - A link (an "edge" in a graph) between two STIX Objects
represented by either an SRO or an embedded relationship
STIX Extension - A set of mechanisms supporting adding new objects and updating
existing objects in a standard way.
TAXII - An application layer protocol for the communication of cyber threat
information
TLP - Traffic Light Protocol
TTP - Tactic, technique, or procedure; behaviors and resources that attackers
use to carry out their attacks
"""

OpenVocab = Annotated[str, Field(...)]
Lang = Annotated[str, Field(...)]
Identifier = Annotated[str, Field(...)]
MappingIdentifier = Annotated[str, Field(..., pattern="^attack-flow-mapping--")]
IdentityIdentifier = Annotated[str, Field(..., pattern="^identity--")]
ProcessIdentifier = Annotated[str, Field(..., pattern="^process--")]
MarkingDefinitionIdentifier = Annotated[
    str,
    Field(..., pattern="^marking-definition--"),
]
ExtensionDefinitionIdentifier = Annotated[
    str,
    Field(..., pattern="^extension-definition--"),
]
BundleIdentifier = Annotated[str, Field(..., pattern="^bundle--")]
StartRefIdentifier = Annotated[
    str,
    Field(..., pattern="^(attack-action|attack-condition)--"),
]
EffectRefIdentifier = Annotated[
    str,
    Field(..., pattern="^(attack-action|attack-operator|attack-condition)--"),
]
ObjectRefIdentifier = Annotated[
    str,
    Field(..., pattern="^[a-z-]+--"),
]

AttackActionIdentifier = Annotated[str, Field(..., pattern="^attack-action--")]
AttackAssetIdentifier = Annotated[str, Field(..., pattern="^attack-asset--")]
AttackConditionIdentifier = Annotated[str, Field(..., pattern="^attack-condition--")]
AttackFlowIdentifier = Annotated[str, Field(..., pattern="^attack-flow--")]
AttackOperatorIdentifier = Annotated[str, Field(..., pattern="^attack-operator--")]
AttackPatternIdentifier = Annotated[str, Field(..., pattern="^attack-pattern--")]


class StixExternalReference(BaseModel):
    source_name: str
    description: str | None = ""
    url: str | None = ""
    hashes: str | None = ""
    external_id: str | None = ""


class StixGranularMarkingModel(BaseModel):
    selectors: list[str]
    lang: Lang | None = ""
    marking_ref: MarkingDefinitionIdentifier | None = None


class StixMetapathParameterSet(BaseModel):
    key: str | None = ""


class StixMetapathParameter(BaseModel):
    attribute: str | None = ""
    expression: str | None = ""
    parameter_type: str | None = ""
    parameters: Any | None = None
    set_context: str | None = ""
    set_attribute: str | None = ""
    return_object_attribute: str | None = ""

    def __init__(self, **data):
        super().__init__(**data)
        parameters = data.get("parameters")
        if not parameters and isinstance(parameters, list):
            self.parameters = []
        if not parameters and isinstance(parameters, str):
            self.parameters = ""
        if not parameters and isinstance(parameters, dict):
            self.parameters = {}


class StixConditionMetapathSingle(BaseModel):
    filter: list[dict] | None = []
    label: str | None = ""
    labelGroup: str | None = ""
    match: str | None = ""
    object: str | None = ""
    parameters: list[StixMetapathParameter] | None = []
    type: str | None = ""


class StixConditionSingle(BaseModel):
    condition_type: str
    metapath: list[StixConditionMetapathSingle] | None = []
    recommended_mitigation_measures: list[str] | None = []
    equation: list[StixMetapathParameter] | None = []
    is_path_prerequisite: bool | None = False
    omit_if: list[StixMetapathParameter] | None = []


class StixGenerationConditionSingle(BaseModel):
    type: str | None = ""
    condition: list[StixConditionSingle] | None = []
    object_ref: str | None = ""


class StixExtension(BaseModel):
    extension_type: str
    generation_condition: list[StixGenerationConditionSingle] | None = []


class StixSDOModel(BaseModel):
    # Required Fields
    id: str
    type: str
    #
    spec_version: str | None = ""
    created: str | None = ""
    modified: str | None = ""
    # Optional Fields
    created_by_ref: IdentityIdentifier | None = None
    revoked: bool | None = False
    labels: list[str] | None = []
    confidence: int | None = None
    lang: Lang | None = ""
    external_references: list[StixExternalReference] | None = []
    object_marking_refs: list[str] | None = []
    granular_markings: list[StixGranularMarkingModel] | None = []
    extensions: dict[str, StixExtension] | None = None


class StixSROModel(BaseModel):
    # Required Fields
    type: str
    spec_version: str
    id: str
    created: str
    modified: str
    # Optional Fields
    created_by_ref: IdentityIdentifier | None = None
    revoked: bool | None = False
    labels: list[str] | None = []
    confidence: int | None = None
    lang: Lang | None = ""
    external_references: list[StixExternalReference] | None = []
    object_marking_refs: list[str] | None = []
    granular_markings: list[StixGranularMarkingModel] | None = []
    extensions: dict[str, StixExtension] | None = None


class StixSCOModel(BaseModel):
    type: str
    spec_version: str | None = ""
    id: str
    object_marking_refs: list[str] | None = []
    granular_markings: list[StixGranularMarkingModel] | None = []
    defanged: bool | None = False
    extensions: dict[str, StixExtension] | None = None


class StixKillChainPhase(BaseModel):
    kill_chain_name: str
    phase_name: str


##################################################
# STIX Domain Objects


class StixAttackAction(StixSDOModel):
    """An ``attack-action`` object represents the execution of a particular technique,
    i.e. a discrete unit of adverary behavior."""

    id: AttackActionIdentifier
    type: Literal[f"{StixObjectType.attack_action.value}"]
    name: str
    # Optional
    description: str | None = ""
    tactic_id: str | None = Field(
        "",
        description="""A tactic identifier or shortname that may reference an
        authoritative collection of tactics, e.g. ATT&CK.""",
    )
    tactic_ref: str | None = Field(
        "",
        description="""A reference to the tactic’s STIX representation. For ATT&CK,
        this should be an x-mitre-tactic object.""",
    )
    technique_id: str | None = Field(
        "",
        description="""A technique identifier or shortname that may reference an
        authoritative collection of techniques, e.g. ATT&CK.""",
    )
    technique_ref: str | None = Field(
        None,
        description="""A reference to the technique’s STIX representation.""",
    )
    execution_start: str | None = Field(
        "",
        description="""Timestamp indicating when the execution of this action began.""",
    )
    execution_end: str | None = Field(
        "",
        description="""Timestamp indicating when the execution of this action ended.""",
    )
    command_ref: ProcessIdentifier | None = Field(
        None,
        description="""Describe tools or commands executed by the attacker by referring
        to a STIX Process object, which can represent commands, environment variables,
        process image, etc.""",
    )
    asset_refs: list[AttackAssetIdentifier] | None = Field(
        [],
        description="""The assets involved in this action, i.e. where this action
        modifies or depends on the state of the asset.""",
    )
    effect_refs: list[EffectRefIdentifier] | None = Field(
        [],
        description="""The potential effects that result from executing this action.""",
    )


class StixAttackAsset(StixSDOModel):
    """An asset is any object that is the subject or target of an action. Assets can be
    technical assets (such as machines and data) or non-technical assets such as people
    and physical systems. Actions typically either modify or depend upon the *state* of
    an asset in some way.\n\nNote that assets are not applicable in all contexts. For
    example, public threat reports may not include enough detail to represent the assets
    in a flow, or the flow might represent aggregate behavior (at the campaign or actor
    level) for which it does not make sense to specify an asset. Assets should be used
    to add context to a flow when the underlying intelligence contains sufficient detail
    to do so."""

    id: AttackAssetIdentifier
    type: Literal[f"{StixObjectType.attack_asset.value}"]
    name: str
    # Optional
    description: str | None = ""
    object_ref: ObjectRefIdentifier | None = Field(
        None,
        description="""A reference to any STIX data object (i.e. SDO) or observable
        (i.e. SCO) that contains structured data about this asset.""",
    )


class StixAttackCondition(StixSDOModel):
    """An ``attack-condition`` object represents some possible condition, outcome, or
    state that could occur. Conditions can be used to split flows based on the success
    or failure of an action, or to provide further description of an action's results.
    """

    id: AttackConditionIdentifier
    type: Literal[f"{StixObjectType.attack_condition.value}"]
    description: str
    # Optional
    pattern: str | None = Field(
        "",
        description="""(This is an experimental feature.) The detection pattern for this
        condition may be expressed as a STIX Pattern or another appropriate language such
        as SNORT, YARA, etc.""",
    )
    pattern_type: str | None = Field(
        "",
        description="""(This is an experimental feature.) The pattern langauge used in this
        condition. The value for this property should come from the STIX pattern-type-ov
        open vocabulary.""",
    )
    pattern_version: str | None = Field(
        "",
        description="""(This is an experimental feature.) The version of the pattern
        language used for the data in the pattern property. For the STIX Pattern language,
        the default value is determined by the spec_version of the condition object.""",
    )
    on_true_refs: list[EffectRefIdentifier] | None = Field(
        [],
        description="When the condition is ``true``, the flow continues to these objects.",
    )
    on_false_refs: list[EffectRefIdentifier] | None = Field(
        [],
        description="""When the condition is ``false``, the flow continues to these
        objects. (If there are no objects, then the flow halts at this node.)""",
    )


class StixAttackFlow(StixSDOModel):
    """
    Every Attack Flow document MUST contain exactly one 'attack-flow' object. It
    provides metadata for name and description, starting points for the flow of
    actions, and can be referenced from other STIX objects.
    """

    id: AttackFlowIdentifier
    type: Literal[f"{StixObjectType.attack_flow.value}"]
    name: str
    scope: StixScopeType | None = Field(
        default=None,
        description="""Indicates what type of behavior the Attack Flow describes:
        a specific incident, a campaign, etc.""",
    )
    start_refs: list[StartRefIdentifier] = Field(
        ...,
        description="A list of objects that start the flow.",
    )
    # Optional
    description: str | None = ""

    class Config:
        use_enum_values = True


class StixAttackOperator(StixSDOModel):
    """An ``attack-operator`` object joins multiple attack paths together using boolean
    logic."""

    id: AttackOperatorIdentifier
    type: Literal[f"{StixObjectType.attack_operator.value}"]
    operator: StixOperatorType
    # Optional
    effect_refs: list[EffectRefIdentifier] | None = Field(
        [],
        description="""The effects, outcomes, or states that result when this operator
        evaluates to true. If the operator evaluates to false, then the flow halts.
        (See: Effects.)""",
    )

    class Config:
        use_enum_values = True


class StixAttackPattern(StixSDOModel):
    id: str
    type: Literal[StixObjectType.attack_pattern]
    name: str
    description: str | None = ""
    aliases: list[str] | None = []
    kill_chain_phases: list[StixKillChainPhase] | None = []


class StixExtensionDefinition(StixSDOModel):
    _schema: str | None = ""
    id: ExtensionDefinitionIdentifier
    created_by_ref: IdentityIdentifier = ""
    description: str | None = ""
    extension_properties: list[str] | None = []
    extension_types: list[StixExtensionType]
    name: str
    type: Literal[f"{StixObjectType.extension_definition.value}"]
    version: str

    def __init__(self, **data):
        super().__init__(**data)
        self._schema = data.get("schema", "")

    def model_dump(self, **kwargs) -> dict[str, Any]:
        dump_val = super().model_dump(**kwargs)
        dump_val["schema"] = kwargs.get("_schema", "")
        return dump_val

    class Config:
        use_enum_values = True


class StixAttackFlowMapping(StixSDOModel):
    id: MappingIdentifier
    type: Literal[f"{StixObjectType.attack_flow_mapping.value}"]
    #
    spec_version: str | None = Field(default="")
    created: str | None = Field(default="")
    modified: str | None = Field(default="")
    #
    name: str | None = ""
    attack_flow_ref: str | None = Field(default="")
    attack_actions: list[AttackAction] | None = Field(default=[])
    generation_condition: list[PackageGenerationCondition] | None = Field(default=[])
    initial_access: str | None = Field(default="")
    key_risk_template: str | None = Field(default="")
    key_risk_template_rules: list[KeyRiskTemplateRule] | None = Field(default=[])
    risk_scenario_template: str | None = Field(default="")
    attack_narrative: AttackNarrativeStepModel | None = Field(
        default_factory=AttackNarrativeStepModel
    )
    #
    default_impact: int | None = Field(default=0)
    default_likelihood: int | None = Field(default=0)
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    recommended_mitigation_measures: MeasuresContext | None = Field(
        default_factory=MeasuresContext
    )
    rule_explanation: Optional["AttackFlowRuleExplanation"] = Field(
        default_factory=AttackFlowRuleExplanation
    )


class StixIdentity(StixSDOModel):
    id: IdentityIdentifier
    name: str
    type: Literal[f"{StixObjectType.identity.value}"]
    contact_information: str | None = ""
    description: str | None = ""
    identity_class: OpenVocab | None = ""
    roles: list[str] | None = []
    sectors: list[OpenVocab] | None = []


StixSDOModels = Annotated[
    StixAttackAction
    | StixAttackAsset
    | StixAttackCondition
    | StixAttackFlow
    | StixAttackOperator
    | StixAttackPattern
    | StixExtensionDefinition
    | StixAttackFlowMapping
    | StixIdentity,
    Field(discriminator="type"),
]


class StixBundle(BaseModel):
    created: str | None = ""
    id: BundleIdentifier
    modified: str | None = ""
    objects: list[StixSDOModels] | None = []
    spec_version: str | None = ""
    type: Literal["bundle"]
