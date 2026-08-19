"""
Type Aliases for Project Input Model Extractor

Comprehensive type definitions for the project input model extractor system.
Provides type aliases for common data structures, configuration objects, and
processing parameters used throughout the extraction pipeline.
"""

from collections.abc import Callable
from typing import Any

from shared_libs.protocols import (
    OntologyModelProtocol,
    OntologyProtocol,
    ProjectInputModelProtocol,
)

# ============================================================================
# CORE DATA STRUCTURE TYPES
# ============================================================================

# Basic data structures
DataStructure = dict[str, Any]
DataList = list[Any]
ObjectDict = dict[str, Any]
ObjectList = list[dict[str, Any]]

# Nested data access
NestedAddress = str
AttributeName = str
ObjectId = str
QuestionId = str

# ============================================================================
# CONFIGURATION AND EXTRACTION TYPES
# ============================================================================

# Configuration objects
QuestionToModelConfig = dict[str, Any]
ExtractionLogic = dict[str, Any]
ExtractionLogicList = list[dict[str, Any]]
ParameterConfig = dict[str, Any]
ParameterList = list[dict[str, Any]]

# Extraction parameters
ExtractionParameters = Any | None
MatchFunction = dict[str, Any]
MatchFunctionList = list[dict[str, Any]]

# Questionnaire and diagram data
QuestionnaireData = dict[str, Any]
QuestionnaireResponse = dict[str, Any]
DiagramData = dict[str, Any]
CanvasData = dict[str, Any]

# ============================================================================
# MODEL AND OBJECT TYPES
# ============================================================================

# Project model types
ProjectInputModelDict = dict[str, Any]
ProjectModel = ProjectInputModelProtocol
OntologyModel = OntologyModelProtocol

# Object structures
ProjectObject = dict[str, Any]
ProjectObjectList = list[dict[str, Any]]
ObjectWithId = dict[str, Any]
ObjectWithValue = dict[str, Any]

# Attribute and reference types
AttributeValue = Any
ObjectReference = Any
NestedValue = Any

# ============================================================================
# PROCESSING AND TRAVERSAL TYPES
# ============================================================================

# Graph and traversal types
Vertex = Any
Edge = Any
GraphStructure = dict[str, Any]
TraversalDefinition = dict[str, Any]
StopCondition = dict[str, Any]

# Second pass processing
SecondPassExtraction = dict[str, Any]
SecondPassExtractionList = list[dict[str, Any]]
ExtractionCondition = dict[str, Any]
ActionExtraction = dict[str, Any]

# ============================================================================
# SOLVER AND EVALUATION TYPES
# ============================================================================

# Solver parameters
SolverValue = Any
SolverAnswer = Any
SolverList = list[Any]
ComparisonResult = tuple[bool, Any | None]
ExistenceResult = tuple[bool, Any | None]

# Expression and equation types
Expression = str
Equation = str
FunctionName = str

# Match and filter types
MatchResult = bool
FilterResults = dict[str, list[Any]]
FilterEquation = str

# ============================================================================
# ONTOLOGY TYPES
# ============================================================================

# Ontology-specific types
OntologyInstance = OntologyProtocol
ClassLabel = str
ClassAddress = str
IndividualName = str
IndividualObject = Any

# Ontology comparison types
OntologyValue = str
OntologyList = list[str]
OntologyComparisonResult = bool

# ============================================================================
# REFERENCE AND MAPPING TYPES
# ============================================================================

# Reference mapping types
QuestionnaireReference = dict[str, str]
ReferenceMapping = dict[str, str]
DynamicReference = dict[str, Any]

# Access control types
AccessControlMapping = list[dict[str, Any]]
AccessControlTable = list[dict[str, Any]]
NodeDataMapping = dict[str, list[str]]
ReverseMapping = dict[str, list[str]]

# ============================================================================
# FUNCTION AND CALLBACK TYPES
# ============================================================================

# Utility function types
RetrieveFunction = Callable[[Any], Any]
AttributeFunction = Callable[[Any, str], Any]
TraversalFunction = Callable[[Any, str, dict[str, Any]], Any]
ConditionFunction = Callable[[Any, Any | None], Any]

# Processing function types
ExtractionFunction = Callable[[Any, Any | None], Any]
CreationFunction = Callable[[Any, Any | None], Any]
EvaluationFunction = Callable[[Any, Any], bool]

# ============================================================================
# COMPLEX DATA STRUCTURE TYPES
# ============================================================================

# Multi-level parameter types
ParameterGrouping = list[dict[str, Any]]
ParameterGroupingList = list[list[dict[str, Any]]]
DynamicKeyNames = list[str]

# Complex object types
ComplexObject = dict[str, Any]
ComplexObjectList = list[dict[str, Any]]
ObjectWithAttributes = dict[str, Any]

# Answer and response types
AnswerStructure = str | dict[str, Any] | list[Any]
AnswerValue = str | list[Any] | None
RawAnswer = Any

# ============================================================================
# VALIDATION AND CHECK TYPES
# ============================================================================

# Validation types
ValidationChecks = dict[str, Any]
PrerequisiteChecks = dict[str, bool]
ExtractionChecks = dict[str, Any]

# Condition types
ConditionResult = bool
PrerequisiteCondition = bool
StopConditionResult = bool

# ============================================================================
# FILE AND PATH TYPES
# ============================================================================

# File path types
FilePath = str
OntologyFilePath = str
SodaliteFilePath = str
FilePaths = tuple[str, str]

# ============================================================================
# SPECIALIZED PROCESSING TYPES
# ============================================================================

# Cell and object creation types
CellInfo = dict[str, Any]
ObjectCreationResult = list[dict[str, Any]]
AttributeCreationResult = dict[str, Any]

# Key-value mapping types
KeyValueMapping = dict[str, Any]
AttributeKeyMapping = dict[str, str]

# Dynamic processing types
DynamicKeyPattern = Any  # re.Pattern
DynamicKeyMatch = bool
DynamicParameter = dict[str, Any]

# ============================================================================
# ERROR AND EXCEPTION TYPES
# ============================================================================

# Exception handling types
ExceptionMessage = str
ErrorContext = dict[str, Any]
LogLevel = str

# ============================================================================
# UTILITY TYPE COMBINATIONS
# ============================================================================

# Common combinations
OptionalString = str | None
OptionalList = list[Any] | None
OptionalDict = dict[str, Any] | None
OptionalObject = dict[str, Any] | None

# Tuple combinations
BoolOptionalTuple = tuple[bool, Any | None]
BoolStringTuple = tuple[bool, str | None]
BoolObjectTuple = tuple[bool, dict[str, Any] | None]
BoolListTuple = tuple[bool, list[Any]]

# Union combinations
StringOrList = str | list[Any]
ObjectOrList = dict[str, Any] | list[dict[str, Any]]
AnyOrNone = Any | None

__all__ = [
    name
    for name in globals()
    if not name.startswith("_") and name not in {"Any", "Callable", "Ontology"}
]
