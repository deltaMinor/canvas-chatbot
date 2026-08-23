class DomainAuthorizationService:
    """No-op mixin.

    Authentication/authorization has been removed from this project. This
    mixin is kept purely so the many domain service classes that still list
    it as a base class continue to work without modification. It exposes no
    behavior of its own.
    """
