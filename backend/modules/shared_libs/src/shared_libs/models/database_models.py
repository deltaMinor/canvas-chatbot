from typing import Optional

from pydantic import ConfigDict, Field

from .alias import QuestionnaireValue
from .base_models.ai_invocation_log import AiInvocationLogBaseModel
from .base_models.attack_graph_rule import KbAttackGraphRuleBaseModel
from .base_models.cacti import ProjectCactiBaseModel
from .base_models.credit_transaction_log import CreditTransactionLogBaseModel
from .base_models.database import DatabaseModel
from .base_models.diagram import (
    MasterADTemplateBaseModel,
    ProjectADBaseModel,
)
from .base_models.diagram_file import ProjectDiagramFilesBaseModel
from .base_models.llm import KbLLMPromptBaseModel
from .base_models.mitigation import MasterMitigationBaseModel
from .base_models.project import ProjectBaseModel
from .base_models.project_assessment import (
    ProjectAssessmentBaseModel,
    ProjectRegisterHistoryBaseModel,
)
from .base_models.question import CQCoreModel, CQTemplateCoreModel
from .base_models.register import (
    MasterRegisterBaseModel,
    ProjectRegisterBaseModel,
    ProjectRiskScenario,
)
from .base_models.register_config import KbAssessmentConfigBaseModel
from .base_models.shared.mitigation import MitigationMeasure
from .base_models.shared.shared.database import MetadataModel
from .base_models.tool import ToolHistoryBaseModel
from .base_models.tosca import KbToscaBaseModel
from .base_models.user_credits import UserCreditsBaseModel
from .base_models.user_plan_config import UserPlanConfigBaseModel
from .base_models.xml import ProjectXMLBaseModel


class KbAttackGraphRuleModel(
    DatabaseModel,
    KbAttackGraphRuleBaseModel,
):
    pass


class MasterADTemplateModel(
    DatabaseModel,
    MasterADTemplateBaseModel,
):
    is_initialized: bool | None = Field(default=False)


class MasterCQModel(
    DatabaseModel,
    CQCoreModel,
):
    is_initialized: bool | None = Field(default=False)
    tags: list[str] | None = Field(default=[])


class ProjectCQModel(
    DatabaseModel,
    CQCoreModel,
):
    project_id: str
    values: Optional["QuestionnaireValue"] = Field(default={})
    is_latest: bool | None = Field(default=False)
    isCompleted: bool | None = Field(default=False)
    cq_version_id: str | None = Field(default="")
    lastCompletedBy: MetadataModel | None = Field(default_factory=MetadataModel)


class MasterCQTemplateModel(
    DatabaseModel,
    CQTemplateCoreModel,
):
    is_initialized: bool | None = Field(default=False)


class ProjectCQTemplateModel(
    DatabaseModel,
    CQTemplateCoreModel,
):
    project_id: str


class MasterRegisterModel(
    DatabaseModel,
    MasterRegisterBaseModel,
):
    pass


class ProjectModel(
    DatabaseModel,
    ProjectBaseModel,
):
    pass


class ProjectADModel(
    DatabaseModel,
    ProjectADBaseModel,
):
    project_id: str


class ProjectRegisterHistoryModel(
    DatabaseModel,
    ProjectRegisterHistoryBaseModel,
):
    project_id: str


class ProjectAssessmentHistoryModel(ProjectAssessmentBaseModel):
    pass


class ProjectAssessmentModel(
    DatabaseModel,
    ProjectAssessmentBaseModel,
):
    project_id: str


class ProjectAssessmentCQModel(
    DatabaseModel,
):
    project_id: str
    assessment_id: str
    project_cq: dict


class ProjectAssessmentMitigationModel(
    DatabaseModel,
):
    project_id: str
    assessment_id: str | None = Field(default="")
    mitigations: list["MitigationMeasure"] | None = Field(default=[])


class ProjectAssessmentDiagramModel(
    DatabaseModel,
):
    project_id: str
    assessment_id: str
    project_diagram: dict


class ProjectAssessmentConfigModel(DatabaseModel):
    project_id: str
    model_config = ConfigDict(extra="allow")


class ProjectRegisterModel(
    DatabaseModel,
    ProjectRegisterBaseModel,
):
    project_id: str
    risk_scenarios: list[ProjectRiskScenario] | None = Field(default=[])


class ProjectCactiModel(
    DatabaseModel,
    ProjectCactiBaseModel,
):
    project_id: str


class ProjectDiagramFilesModel(
    DatabaseModel,
    ProjectDiagramFilesBaseModel,
):
    project_id: str


class ProjectXMLModel(
    DatabaseModel,
    ProjectXMLBaseModel,
):
    project_id: str


class KbLLMPromptModel(
    DatabaseModel,
    KbLLMPromptBaseModel,
):
    pass


class KbAssessmentConfigModel(
    DatabaseModel,
    KbAssessmentConfigBaseModel,
):
    pass


class MasterMitigationModel(
    DatabaseModel,
    MasterMitigationBaseModel,
):
    pass


class KbToscaModel(
    DatabaseModel,
    KbToscaBaseModel,
):
    pass


class ToolHistoryModel(
    DatabaseModel,
    ToolHistoryBaseModel,
):
    pass


class UserCreditsModel(
    DatabaseModel,
    UserCreditsBaseModel,
):
    pass


class AiInvocationLogModel(
    DatabaseModel,
    AiInvocationLogBaseModel,
):
    pass


class CreditTransactionLogModel(
    DatabaseModel,
    CreditTransactionLogBaseModel,
):
    pass


class UserPlanConfigModel(
    DatabaseModel,
    UserPlanConfigBaseModel,
):
    pass


