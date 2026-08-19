import logging

from pymongo import collection, database

logger = logging.getLogger(__name__)


class RepositoryCollection(collection.Collection):
    """
    A class for handling operations related to a repository collection.

    This class extends the Collection class and provides a way to interact with a repository collection in a MongoDB database.

    Attributes:
        database (Database): The MongoDB database that contains the repository collection.
        name (str): The name of the repository collection.
    """

    def __init__(
        self,
        database: database.Database,
        name: str,
    ):
        """
        Constructs all the necessary attributes for the RepositoryCollection object.

        Args:
            database (Database): The MongoDB database that will contain the repository collection.
            name (str): The name of the repository collection.
        """
        self.collection_name = name
        super().__init__(
            database=database,
            name=name,
        )
