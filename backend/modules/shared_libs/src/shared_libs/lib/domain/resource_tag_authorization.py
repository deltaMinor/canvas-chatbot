from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from shared_libs.authorization.authorization_manager import AuthorizationManager
    from shared_libs.producers.authentication_producer import AuthenticationProducer


class DomainResourceTagAuthorizationService:
    def verify_tag_permissions(
        self,
        resource_tags: list[str],
        auth_producer: "AuthenticationProducer",
        permissions: list[str],
    ) -> "AuthorizationManager":
        from shared_libs.authorization.authorization_manager import AuthorizationManager

        authorization_manager = AuthorizationManager(
            auth_producer=auth_producer,
            permissions=permissions,
        )
        authorization_manager.verify_resource_tags(
            resource_tags=resource_tags,
        )
        return authorization_manager
