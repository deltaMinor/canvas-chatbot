import logging
import threading

from shared_libs.infrastructure.repository_watcher import RepositoryWatcher

logger = logging.getLogger(__name__)


class RepositoryThreadManager:
    """
    A class for managing threads of RepositoryWatcher instances.

    This class provides methods to start threads for each RepositoryWatcher instance.

    Attributes:
        repository_watcher_classes (List[RepositoryWatcher]): The list of RepositoryWatcher instances.
    """

    def __init__(self, repository_watcher_classes: list[RepositoryWatcher]):
        """
        Constructs all the necessary attributes for the RepositoryThreadManager object.

        Args:
            repository_watcher_classes (List[RepositoryWatcher]): The list of RepositoryWatcher instances to manage.
        """
        self.repository_watcher_classes = repository_watcher_classes

    def start(self):
        """
        Starts threads for each RepositoryWatcher instance.

        This method creates and starts a new thread for each RepositoryWatcher instance in the repository_watcher_classes list.
        """
        for tm_repository_watcher in self.repository_watcher_classes:
            t = threading.Thread(
                target=tm_repository_watcher.start_process,
                daemon=True,
            )
            t.start()
