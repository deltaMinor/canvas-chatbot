from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from shared_libs.authorization.authorization_manager import AuthorizationManager
    from shared_libs.producers.authentication_producer import AuthenticationProducer


class DomainAuthorizationService:
    def verify_permissions(
        self,
        auth_producer: "AuthenticationProducer",
        permissions: list[str],
        field_permissions: list[str] | None = None,
    ) -> "AuthorizationManager":
        from shared_libs.authorization.authorization_manager import AuthorizationManager

        authorization_manager = AuthorizationManager(
            auth_producer=auth_producer,
            permissions=permissions,
            field_permissions=field_permissions or [],
        )
        if field_permissions is None:
            authorization_manager.verify_standalone_authorization()
            return authorization_manager

        authorization_manager.verify_standalone_field_authorization()
        return authorization_manager
