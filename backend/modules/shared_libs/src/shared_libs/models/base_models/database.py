from collections.abc import Sequence
from typing import Any, Optional, Self

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)

from shared_libs.models.model_validators import AuditLogValidator

from .shared.shared.database import MetadataModel, PatchBaseModel, UserInfoModel

__all__ = [
    "DatabaseMetadataModel",
    "AuditLogModel",
    "DatabaseModel",
    "BatchInfoModel",
    "_CollectionCommonModel",
    "CollectionQueryStrictModel",
    "CollectionQueryModel",
    "DomainRepositoryQueryModel",
    "CollectionUpdateCommonModel",
    "CollectionUpdateOneStrictModel",
    "CollectionUpdateSingleModel",
    "DomainRepositoryUpdateOneModel",
    "_FileCollectionCommonModel",
    "DomainFileRepositoryQueryModel",
    "DomainFileRepositoryInsertOneModel",
    "DomainFileRepositoryUpdateOneModel",
    "DomainFileRepositoryDeleteOneModel",
    "CollectionUpdateParamDictModel",
    "CollectionUpdateSingleListModel",
    "CollectionDeleteOneStrictModel",
    "CollectionDeleteSingleModel",
    "CollectionDeleteManyStrictModel",
    "CollectionDeleteMultipleModel",
    "ParamDictModel",
]


class DatabaseMetadataModel(BaseModel):
    created_on: Optional["MetadataModel"] = Field(
        default_factory=MetadataModel,
    )
    modified_on: Optional["MetadataModel"] = Field(
        default_factory=MetadataModel,
    )


class AuditLogModel(
    MetadataModel,
    PatchBaseModel,
    AuditLogValidator,
):
    logId: str | None = Field(default="")
    action: str | None = Field(default="")
    fieldChanges: dict | None = Field(default={})
    targetKey: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class DatabaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )

    id_: str | None = Field(default="", alias="_id", serialization_alias="_id")
    metadata: Optional["DatabaseMetadataModel"] = Field(
        default_factory=DatabaseMetadataModel,
    )

    @property
    def _id(self) -> str | None:
        return self.id_

    @_id.setter
    def _id(self, value: str | None) -> None:
        self.id_ = "" if value is None else f"{value}"

    def model_dump(self, *args, **kwargs) -> dict:
        if "by_alias" not in kwargs:
            kwargs["by_alias"] = True
        dump_val = super().model_dump(*args, **kwargs)
        dump_val["_id"] = str(self._id)
        return dump_val


class BatchInfoModel(BaseModel):
    batch_session_id: str
    average_unit_size: int | None = Field(default=0)
    batch_count_total: int | None = Field(default=0)
    batch_num: int | None = Field(default=0)
    batch_size: int | None = Field(default=0)
    data_length: int | None = Field(default=0)
    data_size: int | None = Field(default=0)


class _CollectionCommonModel(BaseModel):
    hint: Any | None = None
    comment: str | None = None
    collation: Any | None = None  # pymongo.collation.Collation
    session: Any | None = None  # pymongo.client_session.ClientSession


class CollectionQueryStrictModel(_CollectionCommonModel):
    filter: dict | None = None
    projection: list[str] | dict[str, Any] | None = None
    skip: int | None = Field(default=0)
    limit: int | None = Field(default=0)
    no_cursor_timeout: bool | None = Field(default=False)
    cursor_type: int | None = Field(default=0)
    sort: list[Any] | None = None
    allow_partial_results: bool | None = Field(default=False)
    batch_size: int | None = Field(default=0)  # pymongo.cursor.CursorType
    max_time_ms: int | None = None
    max: Any | None = None
    min: Any | None = None
    return_key: bool | None = Field(default=False)
    show_record_id: bool | None = Field(default=False)
    allow_disk_use: bool | None = None


class CollectionQueryModel(CollectionQueryStrictModel):
    batch_info: Optional["BatchInfoModel"] = None
    user_info: Optional["UserInfoModel"] = None
    collection_name: str | None = Field(default="")


class DomainRepositoryQueryModel(CollectionQueryModel):
    raise_if_not_found: bool | None = Field(default=False)
    raise_if_found: bool | None = Field(default=False)


class CollectionUpdateCommonModel(_CollectionCommonModel):
    filter: dict | None = None
    upsert: bool | None = Field(default=False)
    bypass_document_validation: bool | None = Field(default=False)
    array_filters: Sequence[dict] | None = None
    let: dict | None = None


class CollectionUpdateOneStrictModel(CollectionUpdateCommonModel):
    update: dict | None = None


class CollectionUpdateSingleModel(CollectionUpdateCommonModel):
    payload: dict | None = None
    user_info: Optional["UserInfoModel"] = None
    operator: str | None = None
    collection_name: str | None = Field(default="")
    allow_metadata_created_on_update: bool | None = Field(default=False)


class DomainRepositoryUpdateOneModel(CollectionUpdateSingleModel):
    pass


class _FileCollectionCommonModel(BaseModel):
    query_dict: dict | None = None
    session: Any | None = None


class DomainFileRepositoryQueryModel(_FileCollectionCommonModel):
    pass


class DomainFileRepositoryInsertOneModel(_FileCollectionCommonModel):
    decoded_file: str | None = Field(default="")
    user_info: Optional["UserInfoModel"] = None


class DomainFileRepositoryUpdateOneModel(_FileCollectionCommonModel):
    pass


class DomainFileRepositoryDeleteOneModel(_FileCollectionCommonModel):
    pass


class CollectionUpdateParamDictModel(CollectionUpdateCommonModel):
    payload: dict | None = None


class CollectionUpdateSingleListModel(BaseModel):
    param_dict_list: list["CollectionUpdateParamDictModel"] | None = Field(
        default=[],
    )
    user_info: Optional["UserInfoModel"] = None


class CollectionDeleteOneStrictModel(_CollectionCommonModel):
    filter: dict | None = None
    let: dict | None = None


class CollectionDeleteSingleModel(CollectionDeleteOneStrictModel):
    collection_name: str | None = Field(default="")


class CollectionDeleteManyStrictModel(_CollectionCommonModel):
    filter: dict | None = None
    let: dict | None = None


class CollectionDeleteMultipleModel(CollectionDeleteManyStrictModel):
    collection_name: str | None = Field(default="")


class ParamDictModel(BaseModel):
    filter: dict | None = None
    payload: dict | None = None
