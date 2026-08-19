from pydantic import BaseModel, Field


class ExternalReference(BaseModel):
    description: str | None = ""
    externalId: str | None = ""
    sourceName: str | None = ""
    url: str | None = ""


class MitigationRelationship(BaseModel):
    sourceRef: str | None = ""
    targetRef: str | None = ""
    id: str | None = ""
    relationshipType: str | None = ""


class EmbedThreatObject(BaseModel):
    title: str | None = ""
    url: str | None = ""
    description: str | None = ""


class EmbedThreatEvidence(BaseModel):
    type: str | None = ""
    evidence: list[EmbedThreatObject] | None = []


class KillChainPhase(BaseModel):
    killChainName: str
    phaseName: str


class AttackPatternCoreModel(BaseModel):
    id: str
    type: str


class AttackPattern(
    AttackPatternCoreModel,
):
    mitreId: str | None = ""
    type: str | None = ""
    name: str | None = ""
    description: str | None = ""
    aliases: list[str] | None = []
    labels: list[str] | None = []
    externalReferences: list[ExternalReference] | None = []
    relationships: list[MitigationRelationship] | None = []
    killChainPhases: list[KillChainPhase] | None = []
    firstSeen: str | None = ""
    lastSeen: str | None = ""
    firstSeenCitation: str | None = ""
    lastSeenCitation: str | None = ""
    modifiedByRef: str | None = ""
    revoked: bool | None | None = None
    deprecated: bool | None | None = None
    version: str | None = ""
    attackSpecVersion: str | None = ""
    domains: list[str] | None = []
    platforms: list[str] | None = []
    tacticType: list[str] | None = []
    contributors: list[str] | None = []
    status: str | None = ""
    isSubtechnique: bool | None | None = None
    remoteSupport: bool | None | None = None
    impactType: list[str] | None = []
    embedThreatCategory: str | None = ""
    embedThreatMaturity: str | None = ""
    embedThreatEvidence: EmbedThreatEvidence | None = Field(
        default_factory=EmbedThreatEvidence
    )
    embedThreatCwes: list[EmbedThreatObject] | None = []
    embedThreatCves: list[EmbedThreatObject] | None = []
    embedMitigationMaturity: str | None = ""
    embedMitigationReferences: str | None = ""
    embedMitigationIec62443Mappings: str | None = ""
