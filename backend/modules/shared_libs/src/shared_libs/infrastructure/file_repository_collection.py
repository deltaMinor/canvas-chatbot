import logging

import gridfs
from pymongo.database import Database

logger = logging.getLogger(__name__)


class FileRepositoryCollection(gridfs.GridFS):
    """
    A class for handling operations related to a file repository collection.

    This class extends the GridFS class and provides a way to interact with a file repository collection in a MongoDB database.

    Attributes:
        database (Database): The MongoDB database that contains the file repository collection.
        collection (str): The name of the file repository collection.
    """

    def __init__(
        self,
        database: Database,
        collection: str,
    ):
        """
        Constructs all the necessary attributes for the FileRepositoryCollection object.

        Args:
            database (Database): The MongoDB database that will contain the file repository collection.
            collection (str): The name of the file repository collection.
        """
        super().__init__(
            database=database,
            collection=collection,
        )
        self._database = database
        self._collection_name = collection

    def rename_file(
        self,
        query_dict: dict,
        filename: str,
        modified_on: dict | None = None,
        session=None,
    ) -> int:
        """
        Renames a file in-place by patching its `filename` field directly on
        the underlying `{collection}.files` document, without touching the
        file's binary content/chunks.

        This deliberately bypasses gridfs.GridFS's own put/get machinery
        (which is immutable-by-design) and instead performs a raw metadata
        update on the GridFS `files` collection.

        Args:
            query_dict (dict): The query used to locate the file to rename.
            filename (str): The new filename to set.
            modified_on (dict | None): Optional metadata to record against
                `metadata.modified_on` to track who renamed the file and
                when. Defaults to None (metadata left untouched).
            session: Optional pymongo client session.

        Returns:
            int: The number of documents matched by the query (0 or 1).
        """
        update_fields: dict = {"filename": filename}
        if modified_on is not None:
            update_fields["metadata.modified_on"] = modified_on

        result = self._database[f"{self._collection_name}.files"].update_one(
            query_dict,
            {"$set": update_fields},
            session=session,
        )
        return result.matched_count
