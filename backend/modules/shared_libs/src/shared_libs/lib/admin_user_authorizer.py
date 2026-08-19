from shared_libs.exceptions.api_exceptions import Unauthorized
from shared_libs.producers.authentication_producer import AuthenticationProducer


class AdminUserAuthorizer:
    @staticmethod
    def ensure_admin_user(auth_producer: AuthenticationProducer) -> None:
        if not getattr(auth_producer.authentication_model.user, "is_admin", False):
            raise Unauthorized("Admin access required to complete this operation.")
