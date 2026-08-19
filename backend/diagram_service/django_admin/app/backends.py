import logging

from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.models import User as DjangoUser
from main import celery_app

from shared_libs.decorators import raise_exception
from shared_libs.domain import UserService
from shared_libs.exceptions.api_exceptions import Unauthorized
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.lib.authentication_service.service import AuthenticationService
from shared_libs.lib.encryption_services.password_encryption_service import (
    PasswordEncryptionService,
)
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.models.database_models import UserModel
from shared_libs.producers.producer_data import producer_data_user
from shared_libs.types.enum import UserStatus

logger = logging.getLogger(__name__)


class AdminAuthBackend(BaseBackend):
    def __init__(self):
        self.user_service = UserService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_user,
                    ),
                    celery_app=celery_app,
                )
            )
        )
        from shared_libs.lib.redis_util import get_redis_client

        self.authentication_service = AuthenticationService(
            redis_client=get_redis_client("architecture_diagram")
        )

    @raise_exception(
        "Failed to authenticate user.",
        default_exception=Unauthorized,
        exception_logger=logger,
    )
    def authenticate(
        self,
        request,
        username=None,
        password=None,
        **kwargs,
    ):
        if not username or not password:
            return None

        # Implement your custom authentication logic here
        try:
            db_user = self.user_service.get_one(
                {"username": username},
                raise_if_not_found=True,
            )
            user_model = UserModel(**db_user)

            # Verify password
            password_encryption_service = PasswordEncryptionService()
            if not password_encryption_service.verify_password(
                password=password,
                hashed_password=user_model.password,
            ):
                return None

            # Verify user status
            if user_model.user_status != UserStatus.active.value:
                return None

            # encoded_token_dict = (
            #     self.authentication_service.get_new_encoded_token_dict(
            #         user_model=user_model,
            #     )
            # )

            # user = AnonymousUser.objects.get_or_create(
            #     username=user_model.username,
            # )
            user = DjangoUser()
            user.username = user_model.username
            user.is_staff = True
            user.is_active = True
            return user

            user = AnonymousUser()
            user.username = user_model.username
            user.is_staff = True
            user.is_active = True
            return user
            # user = User.objects.get(username=username)
            # if user.check_password(password):
            #     return user
        except Exception as e:
            logger.error(f"{e}")
            return None
        return None

    def get_user(
        self,
        user_id: str,
    ):
        return None
        # try:
        #     return DjangoUser.objects.get(pk=user_id)
        # except Exception as e:
        #     logger.error(f"{e}")
        #     return None
