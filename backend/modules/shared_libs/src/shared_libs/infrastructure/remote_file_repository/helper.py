from shared_libs.infrastructure.producer.service import Producer


class RemoteFileRepositoryHelper:
    """
    A helper class for handling operations related to a remote file repository.

    This class provides methods to interact with a remote file repository using a producer.

    Attributes:
        producer (Producer): The producer used to interact with the remote file repository.
    """

    def __init__(
        self,
        producer: Producer,
    ):
        """
        Constructs all the necessary attributes for the RemoteFileRepositoryHelper object.

        Args:
            producer (Producer): The producer that this helper will use.
        """
        self.producer = producer
