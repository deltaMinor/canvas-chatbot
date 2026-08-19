import logging
from threading import Lock
from time import time
from typing import TYPE_CHECKING, Any

from shared_libs.decorators import raise_exception

if TYPE_CHECKING:
    from shared_libs.lib.domain import DomainRepositoryService

logger = logging.getLogger(__name__)


class GenericDataStore:
    """A generic data store for caching and retrieving documents.

    This class provides methods for caching and retrieving documents from
    a data store. It interacts with a domain service to fetch documents
    when they are not available in the cache.

    Attributes:
        data_dict (dict): A dictionary for storing cached documents.
        domain_service (DomainRepositoryService): The domain service for
        interacting with the data source.
    """

    def __init__(
        self,
        domain_service: "DomainRepositoryService",
        default_ttl_seconds: int | None = None,
        *args,
        **kwargs,
    ):
        """Initializes the GenericDataStore with the given domain service.

        Args:
            domain_service (DomainRepositoryService): The domain service for
            interacting with the data source.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        """
        self.data_dict = {}
        self.data_dict_multi = {}
        self.data_dict_locks = {}
        self.data_dict_multi_locks = {}
        self.data_dict_locks_lock = Lock()
        self.data_dict_multi_locks_lock = Lock()
        self.domain_service = domain_service
        self.default_ttl_seconds = default_ttl_seconds

    def _get_cache_lock(
        self,
        lock_dict: dict,
        lock_dict_lock: Lock,
        filter_str: str,
    ) -> Lock:
        with lock_dict_lock:
            cache_lock = lock_dict.get(filter_str)
            if cache_lock is None:
                cache_lock = Lock()
                lock_dict[filter_str] = cache_lock
            return cache_lock

    def _get_cache_entry(
        self,
        cache_dict: dict,
        filter_str: str,
    ) -> Any | None:
        cache_entry = cache_dict.get(filter_str)
        if not cache_entry:
            return None

        expires_at = cache_entry.get("expires_at")
        if expires_at is not None and time() >= expires_at:
            cache_dict.pop(filter_str, None)
            return None
        return cache_entry.get("value")

    def _set_cache_entry(
        self,
        cache_dict: dict,
        filter_str: str,
        value: Any,
    ) -> None:
        expires_at = None
        if self.default_ttl_seconds is not None:
            expires_at = time() + self.default_ttl_seconds
        cache_dict[filter_str] = {
            "value": value,
            "expires_at": expires_at,
        }

    @raise_exception(
        "Failed to retrieve one document from data store.",
        exception_logger=logger,
    )
    def get_one(
        self,
        filter=None,
        raise_if_not_found=False,
        raise_if_found=False,
        *args,
        **kwargs,
    ):
        """Retrieves a single document from the data store.

        This method retrieves a single document from the data store based
        on the provided filter. If the document is not available in the
        cache, it fetches the document from the domain service and caches it.

        Args:
            filter (dict, optional): The filter criteria to find the document.
            Defaults to None.
            raise_if_not_found (bool, optional): Whether to raise an exception
            if the document is not found. Defaults to False.
            raise_if_found (bool, optional): Whether to raise an exception
            if the document is found. Defaults to False.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            dict: The retrieved document.

        Raises:
            Exception: If the retrieval of the document fails.
        """
        filter_str = str(filter or {})

        cached_value = self._get_cache_entry(
            cache_dict=self.data_dict,
            filter_str=filter_str,
        )
        if cached_value is not None:
            return cached_value

        cache_lock = self._get_cache_lock(
            lock_dict=self.data_dict_locks,
            lock_dict_lock=self.data_dict_locks_lock,
            filter_str=filter_str,
        )
        with cache_lock:
            cached_value = self._get_cache_entry(
                cache_dict=self.data_dict,
                filter_str=filter_str,
            )
            if cached_value is not None:
                return cached_value

            data = self.domain_service.get_one(
                *args,
                filter=filter,
                raise_if_not_found=raise_if_not_found,
                raise_if_found=raise_if_found,
                **kwargs,
            )
            self._set_cache_entry(
                cache_dict=self.data_dict,
                filter_str=filter_str,
                value=data,
            )
        return data

    @raise_exception(
        "Failed to retrieve multiple documents from data store.",
        exception_logger=logger,
    )
    def get_many(
        self,
        filter=None,
        raise_if_not_found=False,
        raise_if_found=False,
        *args,
        **kwargs,
    ) -> list[Any] | None:
        """Retrieves multiple documents from the data store.

        This method retrieves multiple documents from the data store based
        on the provided filter. If the documents are not available in the
        cache, it fetches the documents from the domain service and caches them.

        Args:
            filter (dict, optional): The filter criteria to find the documents.
            Defaults to None.
            raise_if_not_found (bool, optional): Whether to raise an exception
            if the documents are not found. Defaults to False.
            raise_if_found (bool, optional): Whether to raise an exception
            if the documents are found. Defaults to False.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            List[Any] | None: A list of the retrieved documents or None if no
            documents are found.

        Raises:
            Exception: If the retrieval of the documents fails.
        """
        filter_str = str(filter or {})

        cached_value = self._get_cache_entry(
            cache_dict=self.data_dict_multi,
            filter_str=filter_str,
        )
        if cached_value is not None:
            return cached_value

        cache_lock = self._get_cache_lock(
            lock_dict=self.data_dict_multi_locks,
            lock_dict_lock=self.data_dict_multi_locks_lock,
            filter_str=filter_str,
        )
        with cache_lock:
            cached_value = self._get_cache_entry(
                cache_dict=self.data_dict_multi,
                filter_str=filter_str,
            )
            if cached_value is not None:
                return cached_value

            data = self.domain_service.get_many(
                *args,
                filter=filter,
                raise_if_not_found=raise_if_not_found,
                raise_if_found=raise_if_found,
                **kwargs,
            )
            self._set_cache_entry(
                cache_dict=self.data_dict_multi,
                filter_str=filter_str,
                value=data,
            )
        return data
