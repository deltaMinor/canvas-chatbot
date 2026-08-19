import logging

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.infrastructure.redis_repository.service import RedisRepository
from shared_libs.lib.domain import (
    DomainAuditLogService,
    DomainAuthorizationService,
    DomainRedisRepositoryService,
)
from shared_libs.models.database_models import AuthenticationModel

logger = logging.getLogger(__name__)


class TokenRedisService(
    DomainRedisRepositoryService, DomainAuditLogService, DomainAuthorizationService
):
    """
    Handles token-related operations in Redis.

    Provides methods to save, retrieve, and delete tokens in Redis.

    Attributes:
        redis_repository (RedisRepository): The Redis repository used for token operations.
    """

    redis_name_prefix = "token_signature__"

    def __init__(self, redis_repository: RedisRepository):
        """
        Initializes TokenRedisService with a Redis repository.

        Args:
            redis_repository (RedisRepository): The Redis repository used for token operations.
        """
        super().__init__(redis_repository=redis_repository)

    @raise_exception(
        "Failed to generate Redis key.",
        exception_logger=logger,
    )
    @verify_params(key_list=["encoded_token"])
    def get_redis_key(
        self,
        encoded_token: str,
    ) -> str:
        """
        Generates the Redis key using the provided encoded token.

        This method constructs the Redis key by concatenating the redis_name_prefix with the encoded token.

        Args:
            encoded_token (str): The encoded token used to construct the Redis key.

        Returns:
            str: The constructed Redis key.

        Raises:
            Exception: If there is an error during the key generation process.
        """
        return f"{self.redis_name_prefix}{encoded_token}"

    @raise_exception(
        "Failed to retrieve token hash dictionary from Redis.",
        exception_logger=logger,
    )
    @verify_params(key_list=["encoded_token"])
    def get_token_hash_dict(
        self,
        encoded_token: str,
    ) -> dict | None:
        """
        Retrieves the token hash dictionary from Redis based on the provided encoded token.

        This method generates the Redis key using the encoded token and fetches the corresponding
        hash dictionary from Redis.

        Args:
            encoded_token (str): The encoded token used to construct the Redis key.

        Returns:
            dict | None: The token hash dictionary if found, otherwise None.

        Raises:
            Exception: If there is an error during the retrieval process.
        """
        redis_key = self.get_redis_key(encoded_token=encoded_token)
        return self.get_decoded_hash_dict(
            name=redis_key,
        )

    @raise_exception(
        "An error occurred while retrieving authentication model dict.",
        exception_logger=logger,
    )
    @verify_params(key_list=["encoded_token"])
    def get_authentication_model_dict(
        self,
        encoded_token: str,
        **kwargs,
    ) -> dict | None:
        """
        Retrieves the authentication model dictionary from Redis based on the provided encoded token.

        This method constructs the Redis key using the provided encoded token and the predefined Redis name prefix.
        It then fetches the corresponding item from Redis.

        Args:
            encoded_token (str): The encoded token used to construct the Redis key.
            **kwargs: Additional keyword arguments to be passed to the get_item method.

        Returns:
            dict | None: The authentication model dictionary if found, otherwise None.

        Raises:
            Exception: If there is an error during the retrieval process.
        """
        redis_key = self.get_redis_key(encoded_token=encoded_token)
        return self.get_item(
            name=redis_key,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while saving token.",
        exception_logger=logger,
    )
    @verify_params(key_list=["authentication_model"])
    def save_authentication_model_in_redis(
        self,
        authentication_model: AuthenticationModel,
        **kwargs,
    ) -> bool | None:
        """
        Saves the authentication model in Redis.

        This method saves the given authentication model in Redis with a key that includes the encoded token signature.
        The expiry time for the token is set to the value of 'REDIS_TOKEN_EXPIRY' in kwargs, or 600 seconds by default.

        Args:
            authentication_model (AuthenticationModel): The authentication model to be saved in Redis.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            bool | None: True if the operation was successful, None otherwise.

        Raises:
            Exception: If the save operation fails.
        """
        redis_key = self.get_redis_key(
            encoded_token=authentication_model.encoded_token,
        )
        return self.set_item(
            name=redis_key,
            mapping=authentication_model.model_dump(),
            expiry=kwargs.get("REDIS_TOKEN_EXPIRY", 600),
            mapping_list=[{"user_id": authentication_model.decoded_token.user_id}],
            **kwargs,
        )

    @raise_exception(
        "An error occurred while deleting tokens.",
        exception_logger=logger,
    )
    @verify_params(key_list=["user_id"])
    def delete_decoded_tokens(
        self,
        user_id: str,
        **kwargs,
    ):
        """
        Deletes decoded tokens for a specific user.

        This method deletes all decoded tokens associated with the user specified by the 'user_id' parameter.
        It searches for tokens using the pattern "encoded_token:*" and the provided user ID.

        Args:
            user_id (str): The ID of the user whose tokens are to be deleted.
            **kwargs: Additional parameters for the deletion operation. These can include options like 'count' and 'type'.

        Returns:
            int: The number of tokens deleted.

        Raises:
            Exception: If an error occurs while trying to delete the tokens.
        """
        return self.delete_items(
            patterns=["encoded_token:*"],
            mapping={"user_id": user_id},
            **kwargs,
        )

    @raise_exception(
        "Failed to remove token signature hash.",
        exception_logger=logger,
    )
    def remove_token_signature_hash(
        self,
        user_id: str,
    ):
        """
        Removes the token signature hash associated with a user from Redis.

        This method retrieves the user's token signature hashes from Redis, deletes them,
        and returns the result of the deletion operation.

        Args:
            user_id (str): The ID of the user whose token signature hashes are to be removed.

        Returns:
            dict: A dictionary containing the result of the deletion operation.

        Raises:
            Exception: If there is an error removing the token signature hash.
        """
        redis_token_dict = self.redis_repository.get_redis_hash_by_pattern_match(
            pattern="token_signature__*"
        )
        redis_token_keys = [
            k for k, v in redis_token_dict.items() if v.get("user_id") == user_id
        ]
        res = self.redis_repository.delete_item_in_redis(
            names=redis_token_keys,
        )
        return res

    @raise_exception(
        "Failed to remove session cache.",
        exception_logger=logger,
    )
    def remove_session_cache(
        self,
        user_id: str,
    ):
        """
        Removes the session cache associated with a user from Redis.

        This method retrieves the user's session cache from Redis, deletes the cache,
        and returns the result of the deletion operation.

        Args:
            user_id (str): The ID of the user whose session cache is to be removed.

        Returns:
            dict: A dictionary containing the result of the deletion operation.

        Raises:
            Exception: If there is an error removing the session cache.
        """
        redis_session_dict = self.redis_repository.get_pickled_object_by_pattern_match(
            pattern="*django.contrib.sessions.cache*"
        )
        redis_session_keys = [
            k for k, v in redis_session_dict.items() if v.get("user_id") == user_id
        ]
        res = self.redis_repository.delete_item_in_redis(
            names=redis_session_keys,
        )
        return res

    @raise_exception(
        "An error occurred while terminating user sessions.",
        exception_logger=logger,
    )
    def terminate_user_sessions(self, user_id: str):
        """
        Terminates all sessions associated with a user by removing token signature hashes and session cache from Redis.

        This method removes the user's token signature hashes and session cache from Redis,
        and returns the results of these operations.

        Args:
            user_id (str): The ID of the user whose sessions are to be terminated.

        Returns:
            Tuple[dict, dict]: A tuple containing the results of removing the token signature hashes
                               and the session cache from Redis.

        Raises:
            Exception: If there is an error terminating the user's sessions.
        """
        res1 = self.remove_token_signature_hash(
            user_id=user_id,
        )
        res2 = self.remove_session_cache(
            user_id=user_id,
        )
        return res1, res2
