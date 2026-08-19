from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from shared_libs.authorization.authorization_manager import AuthorizationManager
    from shared_libs.producers.authentication_producer import AuthenticationProducer


class DomainProjectAuthorizationService:
    def verify_project_permissions(
        self,
        project_id: str,
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
        if field_permissions is not None:
            authorization_manager.verify_project_field_authorization(
                project_id=project_id,
            )
            return authorization_manager

        authorization_manager.verify_project_id(
            project_id=project_id,
        )
        return authorization_manager
