from unittest.mock import Mock, patch

from pymongo.results import DeleteResult, UpdateResult
from src.shared_libs.infrastructure.repository.service import Repository
from src.shared_libs.infrastructure.repository_collection import RepositoryCollection
from src.shared_libs.models.base_models import (
    CollectionDeleteManyStrictModel,
    CollectionQueryStrictModel,
    CollectionUpdateOneStrictModel,
    CollectionUpdateSingleModel,
)


def test_find_single():
    # Arrange
    mock_collection = Mock(spec=RepositoryCollection)
    mock_collection.find_one.return_value = {"_id": "123", "name": "test"}

    repository = Repository(mock_collection)

    expected_result = {"_id": "123", "name": "test"}

    # Act
    result = repository.find_single(_id="123")

    # Assert
    mock_collection.find_one.assert_called_once_with(
        **CollectionQueryStrictModel(_id="123").model_dump()
    )
    assert result == expected_result


def test_find_multiple():
    # Arrange
    mock_collection = Mock(spec=RepositoryCollection)
    mock_collection.find.return_value = [
        {"_id": "123", "name": "test"},
        {"_id": "456", "name": "test2"},
    ]

    repository = Repository(mock_collection)

    expected_result = [
        {"_id": "123", "name": "test"},
        {"_id": "456", "name": "test2"},
    ]

    # Act
    result = repository.find_multiple(name="test")

    # Assert
    mock_collection.find.assert_called_once_with(
        **CollectionQueryStrictModel(name="test").model_dump()
    )
    assert result == expected_result


def test_update_single():
    # Arrange
    mock_collection = Mock(spec=RepositoryCollection)
    mock_collection.update_one.return_value = Mock(spec=UpdateResult)

    repository = Repository(mock_collection)

    payload = {
        "name": "test",
        "body": "test-body",
    }
    user_info = {"user_id": "123", "username": "test_user"}
    kwargs = {"operator": "$set", "filter": {"name": "test"}}
    metadata_model = repository.get_metadata_model(payload, user_info)

    # Act
    result = repository.update_single(payload, user_info, **kwargs)

    # Assert
    assert isinstance(result, UpdateResult)
    mock_collection.update_one.assert_called_once_with(
        **CollectionUpdateOneStrictModel(
            **kwargs,
            update={
                "$set": {
                    **payload,
                    "metadata": metadata_model.model_dump(),
                }
            },
        ).model_dump(),
    )


@patch.object(Repository, "update_single")
def test_update_single_list(mock_update_single):
    mock_update_single.return_value = Mock(spec=UpdateResult)
    repository = Repository(Mock(spec=RepositoryCollection))

    param_dict_list = [
        {
            "filter": {"_id": "123"},
            "payload": {"_id": "123", "name": "test"},
        },
        {
            "filter": {"_id": "456"},
            "payload": {"_id": "456", "name": "test2"},
        },
    ]
    user_info = {"user_id": "789", "username": "test_user"}

    # Act
    result_list = repository.update_single_list(param_dict_list, user_info)

    # Assert
    assert mock_update_single.call_count == len(param_dict_list)
    assert all(isinstance(result, UpdateResult) for result in result_list)
    for param_dict in param_dict_list:
        mock_update_single.assert_any_call(
            **CollectionUpdateSingleModel(
                **param_dict,
                user_info=user_info,
            ).model_dump(),
        )


def test_delete_multiple():
    # Arrange
    mock_collection = Mock(spec=RepositoryCollection)
    mock_collection.delete_many.return_value = Mock(spec=DeleteResult)

    repository = Repository(mock_collection)

    kwargs = {"filter": {"name": "test"}}

    # Act
    result = repository.delete_multiple(**kwargs)

    # Assert
    assert isinstance(result, DeleteResult)
    mock_collection.delete_many.assert_called_once_with(
        **CollectionDeleteManyStrictModel(**kwargs).model_dump(),
    )
