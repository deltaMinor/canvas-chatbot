from shared_libs.infrastructure.producer.service import Producer


class RemoteRepositoryHelper:
    """
    A helper class for handling operations related to a remote repository.

    This class provides methods to interact with a remote repository using a producer.

    Attributes:
        producer (Producer): The producer used to interact with the remote repository.
    """

    def __init__(self, producer: Producer):
        """
        Constructs all the necessary attributes for the RemoteRepositoryHelper object.

        Args:
            producer (Producer): The producer that this helper will use.
        """
        self.producer = producer
