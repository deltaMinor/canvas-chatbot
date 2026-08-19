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
