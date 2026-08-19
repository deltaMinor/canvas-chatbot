from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from shared_libs.authorization.authorization_manager import AuthorizationManager
    from shared_libs.producers.authentication_producer import AuthenticationProducer


class DomainUserAuthorizationService:
    def verify_user_permissions(
        self,
        user_id_list: list[str],
        auth_producer: "AuthenticationProducer",
        permissions: list[str],
    ) -> "AuthorizationManager":
        from shared_libs.authorization.authorization_manager import AuthorizationManager

        authorization_manager = AuthorizationManager(
            auth_producer=auth_producer,
            permissions=permissions,
        )
        authorization_manager.verify_user_id_list(
            user_id_list=user_id_list,
        )
        return authorization_manager
