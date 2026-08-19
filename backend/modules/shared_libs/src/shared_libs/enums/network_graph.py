from enum import Enum


class PrivilegeNoneType(Enum):
    """
    Privilege with 'none' option.
    (NONE, USER, ADMIN)
    """

    NONE = "none"
    USER = "user"
    ADMIN = "admin"


class PrivilegeWildcardType(Enum):
    """
    Privilege with 'any' option.
    (USER, ADMIN, ANY)
    """

    USER = "user"
    ADMIN = "admin"
    ANY = "_"


class PrivilegeAllType(Enum):
    """
    Privilege with all option.
    (NONE, USER, ADMIN, ANY)
    ANY does not include NONE.
    """

    NONE = "none"
    USER = "user"
    ADMIN = "admin"
    ANY = "_"


class PrivilegeLocated(Enum):
    """
    Required Privilege Located.
    - LOCAL as default.
    - VIRTUAL if attack vector is LOCAL_VIRTUAL_NETWORK and the required privilege is from virtual machine / container.
    (LOCAL, VIRTUAL)
    """

    LOCAL = "local"
    VIRTUAL = "virtual"


class UserCompetency(Enum):
    """
    User competency.
    (INCOMPETENT, COMPETENT)
    """

    COMPETENT = "competent"
    INCOMPETENT = "incompetent"


class VulnerabilityConsequence(Enum):
    """
    Vulnerability consequence.
    (PRIV_ESCALATION, CRED_COMPROMISE)
    """

    PRIV_ESCALATION = "privEscalation"
    CRED_COMPROMISE = "credCompromise"
    DATA_POSSESSION = "dataPossession"


class VulnerabilityPostTarget(Enum):
    """
    Vulnerability post target
    (SELF, VIRTUAL_MACHINE, CONTAINER, USER_INTERACTION, OTHERS)
    """

    SELF = "self"
    VIRTUAL_MACHINE = "virtualMachine"
    CONTAINER = "container"
    USER_INTERACTION = "userInteraction"
    OTHERS = "others"


class AttackVector(Enum):
    """
    Attack vector based on CVSS.
    (LOCAL, NETWORK, LOCAL_VIRTUAL_NETWORK)

    LOCAL = Vulnerability is not bound to the network stack
    NETWORK = Vulnerability is bound to the network stack
    LOCAL_VIRTUAL_NETWORK = LOCAL but with a virtual network stack (e.g.: Virtual Machine, Container)
    """

    LOCAL = "local"
    NETWORK = "network"
    LOCAL_VIRTUAL_NETWORK = "localVirtualNetwork"


class UserInteraction(Enum):
    """
    User interaction based on CVSS.
    (NONE, REQUIRED)
    """

    NONE = "none"
    REQUIRED = "required"


class VirtualGuest(Enum):
    """
    Virtual guest based on CVSS.
    (VIRTUAL_MACHINE, CONTAINER)
    """

    VIRTUAL_MACHINE = "virtualMachine"
    CONTAINER = "container"


class NodeType(Enum):
    ANALYTICS = "analytics"
    STREAMING = "streaming"
    DATA_SEARCH = "dataSearch"
    SENSOR = "sensor"
    ACTUATOR = "actuator"
    CONTROLLER = "controller"
    VM = "vm"
    COMPUTE = "compute"
    DOMAIN_CONTROLLER = "domainController"
    ACCOUNT_MANAGEMENT = "accountManagement"
    CODE_DEPLOY = "codeDeploy"
    CLOUD = "cloud"
    CLOUD_ADMINISTRATION = "cloudAdministration"
    ORCHESTRATION = "orchestration"
    USER = "user"
    SUBNET = "subnet"
    INTERFACE = "interface"


class HasAppAccess(Enum):
    READ = "read"
    WRITE = "write"


class NetControl(Enum):
    READ = "read"
    WRITE = "write"
    BLOCK = "block"


__all__ = [
    "AttackVector",
    "HasAppAccess",
    "NetControl",
    "NodeType",
    "PrivilegeAllType",
    "PrivilegeLocated",
    "PrivilegeNoneType",
    "PrivilegeWildcardType",
    "UserCompetency",
    "UserInteraction",
    "VirtualGuest",
    "VulnerabilityConsequence",
    "VulnerabilityPostTarget",
]
