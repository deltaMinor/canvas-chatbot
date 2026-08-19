import logging
from collections.abc import Callable
from datetime import datetime
from typing import TYPE_CHECKING, Union

from shared_libs.constants.system import SYSTEM_USER_INFO
from shared_libs.decorators import raise_exception
from shared_libs.lib_config import TZINFO
from shared_libs.models.base_models import AuditLogModel, DatabaseModel, PatchBaseModel
from shared_libs.types.auditLog import AuditLogAction

if TYPE_CHECKING:
    from pymongo.results import UpdateResult

    from shared_libs.lib.domain import DomainRepositoryService


ModelType = Union["PatchBaseModel", "DatabaseModel"]

logger = logging.getLogger(__name__)


class ModelValidationUtil:
    def __init__(
        self,
        domain_service: "DomainRepositoryService",
        db_log_service: "DomainRepositoryService" = None,
        user_info=SYSTEM_USER_INFO,
    ):
        """
        Initializes the ModelValidationUtil with required services and user information.

        Args:
            domain_service (DomainRepositoryService): The service used to update the main domain
                documents.
            db_log_service (DomainRepositoryService, optional): The service used to update audit log
                documents. Defaults to None.
            user_info (dict, optional): Information about the user performing the operation.
                Defaults to SYSTEM_USER_INFO.

        Attributes:
            domain_service (DomainRepositoryService): Service for main domain operations.
            db_log_service (DomainRepositoryService): Service for audit log operations.
            user_info (dict): Information about the user performing the operation.
            timestamp (datetime): The timestamp when the utility was instantiated.
        """
        self.domain_service = domain_service
        self.db_log_service = db_log_service
        self.user_info = user_info
        self.timestamp = datetime.now(TZINFO)

    @raise_exception(
        "Failed to construct audit log model.",
        exception_logger=logger,
    )
    def get_audit_log_model(
        self,
        payload: dict,
        targetKey: str,
        identifiers: dict,
        action: AuditLogAction,
    ) -> "AuditLogModel":
        """
        Creates an AuditLogModel instance for patch actions, capturing the provided payload and
        associated metadata.

        Args:
            payload (dict): The data to be included in the audit log entry.
            targetKey (str): The target key associated with the audit log entry.
            identifiers (dict): Additional identifiers to include in the audit log.

        Returns:
            AuditLogModel: An instance representing the audit log entry for the patch action.

        Raises:
            Exception: If the audit log model construction fails.
        """
        return AuditLogModel(
            action=action,
            fieldChanges={
                "identifiers": identifiers,
                "value": payload,
            },
            targetKey=targetKey,
            user_id=self.user_info["user_id"],
            username=self.user_info["username"],
            timestamp=self.timestamp,
        )

    @classmethod
    @raise_exception(
        "Failed to check if patch is required.",
        exception_logger=logger,
    )
    def check_if_patch_required(
        cls,
        model: "ModelType",
    ) -> bool:
        """
        Recursively checks if a patch (update) is required for the given model or any of its nested
        fields.

        This method determines if the provided model instance or any of its nested fields require a
        patch by checking for the presence and value of the '_patch' attribute.

        Args:
            model (ModelType): The model instance to check for pending changes.

        Returns:
            bool: True if a patch is required (i.e., the model or any nested field has the '_patch'
                attribute set to True), otherwise False.

        Notes:
            - Returns False if the model is None or does not have a 'model_dump' method.
            - Checks the '_patch' attribute on the model and recursively on all nested fields,
                including lists of models.
        """
        return cls.check_if_action_required(model, "_patch")

    @classmethod
    @raise_exception(
        "Failed to check if unset is required.",
        exception_logger=logger,
    )
    def check_if_unset_required(
        cls,
        model: "ModelType",
    ) -> bool:
        """
        Recursively checks if a unset (update) is required for the given model or any of its nested
        fields.

        This method determines if the provided model instance or any of its nested fields require a
        unset by checking for the presence and value of the '_unset' attribute.

        Args:
            model (ModelType): The model instance to check for pending changes.

        Returns:
            bool: True if a unset is required (i.e., the model or any nested field has the '_unset'
                attribute set to True), otherwise False.

        Notes:
            - Returns False if the model is None or does not have a 'model_dump' method.
            - Checks the '_unset' attribute on the model and recursively on all nested fields,
                including lists of models.
        """
        return cls.check_if_action_required(model, "_unset")

    @classmethod
    @raise_exception(
        "Failed to check if action is required.",
        exception_logger=logger,
    )
    def check_if_action_required(
        cls,
        model: "ModelType",
        _action: str,
    ) -> bool:
        """
        Recursively checks if an action is required for the given model or any of its nested
        fields.

        This method determines if the provided model instance or any of its nested fields require
        the action by checking for the presence and value of the '_action' attribute.

        Args:
            model (ModelType): The model instance to check for pending changes.
            _action (str): The required action

        Returns:
            bool: True if the action is required (i.e., the model or any nested field has the
                '_action' attribute set to True), otherwise False.

        Notes:
            - Returns False if the model is None or does not have a 'model_dump' method.
            - Checks the '_action' attribute on the model and recursively on all nested fields,
                including lists of models.
        """
        if not model or not hasattr(model, "model_dump"):
            return False

        if getattr(model, _action, False):
            return True

        for field_key in type(model).model_fields.keys():
            field_model = getattr(model, field_key)
            if isinstance(field_model, list):
                for field_model_model in field_model:
                    _action_required = cls.check_if_action_required(
                        model=field_model_model,
                        _action=_action,
                    )
                    if _action_required:
                        return True
                continue

            _action_required = cls.check_if_action_required(
                model=field_model,
                _action=_action,
            )
            if _action_required:
                return True
        return False

    @classmethod
    def collect_action_paths(
        cls,
        model: "ModelType",
        _action: str,
        prefix: str = "",
    ) -> list[str]:
        if not model or not hasattr(model, "model_dump"):
            return []

        model_name = type(model).__name__
        model_path = prefix or model_name
        action_paths = []
        if getattr(model, _action, False):
            action_paths.append(model_path)

        for field_key in type(model).model_fields.keys():
            field_model = getattr(model, field_key)
            field_path = f"{model_path}.{field_key}"
            if isinstance(field_model, list):
                for idx, field_model_model in enumerate(field_model):
                    action_paths.extend(
                        cls.collect_action_paths(
                            model=field_model_model,
                            _action=_action,
                            prefix=f"{field_path}[{idx}]",
                        )
                    )
                continue

            action_paths.extend(
                cls.collect_action_paths(
                    model=field_model,
                    _action=_action,
                    prefix=field_path,
                )
            )
        return action_paths

    @raise_exception(
        "Failed to run default update_func.",
        exception_logger=logger,
    )
    def update_func(
        self,
        filter: dict,
        payload: dict,
        action: AuditLogAction,
        targetKey: str = "",
        log_collection_name: str = "",
    ) -> list["UpdateResult"]:
        """
        Updates both the main domain document and its corresponding audit log document in the
        database.

        This method performs two update operations:
        1. Updates the main document in the domain service using the provided filter and payload.
        2. If audit logging is enabled (i.e., db_log_service, targetKey, and log_collection_name are
            provided), it creates and upserts an audit log document in the log service.

        Args:
            filter (dict): The filter criteria to locate the main document to update.
            payload (dict): The data to update in the main document.
            targetKey (str, optional): The target key associated with the audit log entry.
            log_collection_name (str, optional): The name of the collection where audit logs are
                stored.

        Returns:
            List[UpdateResult]: A list containing the results of the main document update and, if
                applicable, the audit log update operation.

        Raises:
            Exception: If the update operation fails.
        """
        res1 = self.domain_service.update_one(
            filter=filter,
            payload=payload,
            user_info=self.user_info,
            allow_metadata_created_on_update=True,
        )
        if not self.db_log_service or not targetKey or not log_collection_name:
            return [res1]

        audit_log_model = self.get_audit_log_model(
            payload=payload,
            targetKey=targetKey,
            identifiers=filter,
            action=action,
        )

        res2 = self.db_log_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=self.user_info,
            upsert=True,
            collection_name=log_collection_name,
        )
        return [res1, res2]

    @raise_exception(
        "Failed to run default unset_func.",
        exception_logger=logger,
    )
    def unset_func(
        self,
        filter: dict,
        payload: dict,
        action: AuditLogAction,
        model: ModelType,
        targetKey: str = "",
        log_collection_name: str = "",
    ) -> list["UpdateResult"]:
        """Unsets fields in the main domain document and updates the audit log.

        This method performs the following steps:
          1. Retrieves the current document from the domain service using the provided filter.
          2. Determines which fields will be unset based on the payload.
          3. Unsets the specified fields in the main document.
          4. If audit logging is enabled, creates and upserts an audit log entry reflecting the unset operation.

        Args:
            filter (dict): Criteria to locate the main document to update.
            payload (dict): Fields to unset in the main document (keys to unset, values ignored).
            action (AuditLogAction): The audit log action type for this operation.
            model (ModelType): The model instance being processed (not directly used in this method).
            targetKey (str, optional): The target key associated with the audit log entry. Defaults to "".
            log_collection_name (str, optional): The name of the collection where audit logs are stored. Defaults to "".

        Returns:
            List[UpdateResult]: A list containing the result of the main document update and, if applicable, the audit log update.

        Raises:
            Exception: If any of the operations fail.
        """
        res: dict = self.domain_service.get_one(
            filter=filter,
            user_info=self.user_info,
            raise_if_not_found=True,
        )
        data_unset = {k: v for k, v in res.items() if k in payload.keys()}

        res1 = self.domain_service.update_one(
            filter=filter,
            payload=payload,
            user_info=self.user_info,
            operator="$unset",
        )
        if not self.db_log_service or not targetKey or not log_collection_name:
            return [res1]

        audit_log_model = self.get_audit_log_model(
            payload=data_unset,
            targetKey=targetKey,
            identifiers=filter,
            action=action,
        )

        res2 = self.db_log_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=self.user_info,
            upsert=True,
            collection_name=log_collection_name,
        )
        return [res1, res2]

    @raise_exception(
        "Failed to patch model.",
        exception_logger=logger,
    )
    def patch_model(
        self,
        model: ModelType,
        filter: dict = None,
        targetKey: str = "",
        log_collection_name: str = "",
        payload: dict = None,
    ) -> list["UpdateResult"]:
        """
        This function updates the document and audit log in database if patching is required.

        Args:
            model (ModelType): The model instance to process for patching.
            filter (dict, optional): The filter criteria from the model.
            targetKey (str, optional): The target key associated with the audit log entry.
            log_collection_name (str, optional): The name of the collection where audit logs are
                stored.
            payload (dict, optional): The data to update in the main document. If not provided, uses
                the model's dump.

        Returns:
            List[UpdateResult]: A list containing the results of the main document update and the
                audit log update operations.
                Returns None if a patch is not required.
        """
        patch_required = self.check_if_patch_required(
            model=model,
        )
        if not patch_required:
            return []

        # patch_paths = self.collect_action_paths(model=model, _action="_patch")
        # logger.warning(
        #     "Patching model: model=%s targetKey=%s filter=%s patch_paths=%s",
        #     type(model).__name__,
        #     targetKey or "",
        #     filter or {},
        #     patch_paths,
        # )
        res_arr = self.update_func(
            filter=filter,
            payload=payload,
            targetKey=targetKey,
            log_collection_name=log_collection_name,
            action=AuditLogAction.patch.value,
        )
        return res_arr

    @raise_exception(
        "Failed to unset model.",
        exception_logger=logger,
    )
    def unset_model(
        self,
        model: ModelType,
        filter: dict = None,
        targetKey: str = "",
        log_collection_name: str = "",
    ) -> list["UpdateResult"]:
        """
        This function removes fields and updates the document and audit log in database if unset is
        required.

        Args:
            model (ModelType): The model instance to process for unset.
            filter (dict, optional): The filter criteria from the model.
            targetKey (str, optional): The target key associated with the audit log entry.
            log_collection_name (str, optional): The name of the collection where audit logs are
                stored.

        Returns:
            List[UpdateResult]: A list containing the results of the main document update and the
                audit log update operations.
                Returns None if a patch is not required.
        """
        unset_required = self.check_if_unset_required(
            model=model,
        )
        if not unset_required:
            return []

        unset_paths = self.collect_action_paths(model=model, _action="_unset")
        logger.warning(
            "Unsetting model: model=%s targetKey=%s filter=%s unset_paths=%s unsetkeys=%s",
            type(model).__name__,
            targetKey or "",
            filter or {},
            unset_paths,
            getattr(model, "_unsetkeys", []),
        )
        res_arr = self.unset_func(
            filter=filter,
            payload={k: "" for k in model._unsetkeys},
            model=model,
            targetKey=targetKey,
            log_collection_name=log_collection_name,
            action=AuditLogAction.unset.value,
        )
        return res_arr

    @raise_exception(
        "Failed to process validated model.",
        exception_logger=logger,
    )
    def process_model(
        self,
        model: ModelType,
        get_filter_func: Callable[[ModelType], dict],
        targetKey: str = "",
        log_collection_name: str = "",
        payload: dict = None,
    ) -> list["UpdateResult"]:
        """
        Processes a single model for patching by checking if a patch is required, generating an
        audit log, and updating both the main and audit log documents.

        This method checks if a patch is required for the given model. If so, it generates an audit
        log model and updates both the main domain document and the corresponding audit log document
        in the database.

        Args:
            model (ModelType): The model instance to process for patching.
            get_filter_func (Callable[[ModelType], dict]): A function that extracts the filter
                criteria from the model.
            targetKey (str, optional): The target key associated with the audit log entry.
            log_collection_name (str, optional): The name of the collection where audit logs are
                stored.
            payload (dict, optional): The data to update in the main document. If not provided, uses
                the model's dump.

        Returns:
            List[UpdateResult]: A list containing the results of the main document update and the
                audit log update operations.
                Returns None if a patch is not required.

        Raises:
            Exception: If any of the update operations fail.
        """
        filter = get_filter_func(model)
        payload = payload or model.model_dump()
        res_arr = []

        res_arr.extend(
            self.patch_model(model, filter, targetKey, log_collection_name, payload)
        )
        res_arr.extend(self.unset_model(model, filter, targetKey, log_collection_name))
        return res_arr

    @raise_exception(
        "Failed to process validated models.",
        exception_logger=logger,
    )
    def process_models(
        self,
        models: list[ModelType],
        get_filter_func: Callable[[ModelType], dict],
        targetKey: str = "",
        log_collection_name: str = "",
        payload: dict = None,
    ) -> list[list["UpdateResult"]]:
        """
        Processes a list of models for patching by checking if a patch is required for each,
        generating audit logs, and updating both the main and audit log documents.

        For each model in the provided list, this method checks if a patch is required. If so, it
        generates an audit log model and updates both the main domain document and the corresponding
        audit log document in the database.

        Args:
            models (List[ModelType]): A list of model instances to process for patching.
            get_filter_func (Callable[[ModelType], dict]): A function that extracts the filter
                criteria from each model.
            targetKey (str, optional): The target key associated with the audit log entry.
            log_collection_name (str, optional): The name of the collection where audit logs are
                stored.
            payload (dict, optional): The data to update in the main document. If not provided, uses
                the model's dump.

        Returns:
            List[List[UpdateResult]]: A list of lists, each containing the results of the main
                document update and the audit log update operations for each model.

        Raises:
            Exception: If any of the update operations fail.
        """
        res_arr = []
        for model in models:
            _res_arr = self.process_model(
                model=model,
                get_filter_func=get_filter_func,
                targetKey=targetKey,
                log_collection_name=log_collection_name,
                payload=payload,
            )
            res_arr.append(_res_arr)
        return res_arr
