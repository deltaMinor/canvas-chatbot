"""
User Activity Master Timer for managing user session timeouts.

This module provides comprehensive user activity monitoring and session management
through automatic timer validation, session termination, and activity tracking.
"""

import logging
import threading
import time
from typing import TYPE_CHECKING

from shared_libs.decorators import raise_exception
from shared_libs.lib_config import TIMER_THREADING_INTERVAL, TIMER_THRESHOLD

if TYPE_CHECKING:
    from shared_libs.infrastructure.producer.service import Producer


logger = logging.getLogger(__name__)


class UserActivityMasterTimer:
    """
    User Activity Master Timer for session management and timeout handling.

    Provides automated user activity monitoring, session timeout management,
    and automatic session termination for inactive users using threading.

    Attributes:
        producer (Producer): Producer service for task execution and token operations
        master_time_dict (dict): Dictionary storing user activity start times
    """

    master_time_dict = {}

    def __init__(
        self,
        producer: "Producer",
    ):
        """
        Initialize the UserActivityMasterTimer instance.

        Args:
            producer (Producer): Producer service instance for task execution and token operations
        """
        self.producer = producer

    @raise_exception(
        "Failed to kill user session.",
        exception_logger=logger,
    )
    def _kill_user_session(self, user_id: str) -> None:
        """
        Terminate user session and revoke all associated tokens.

        Args:
            user_id (str): The ID of the user whose session is to be terminated
        """
        logger.info(f"[ SHARED-LIB ] Terminating user session for user_id: {user_id}")
        self.master_time_dict.pop(user_id, None)  # Safe removal with default
        self.producer.get_task_value(
            task_type="delete_all_tokens",
            task_body={"user_id": user_id},
        )
        logger.info(
            f"[ SHARED-LIB ] Successfully terminated session for user_id: {user_id}"
        )

    @raise_exception(
        "Failed to retrieve elapsed time.",
        exception_logger=logger,
    )
    def _get_elapsed_time(self, user_id: str) -> float:
        """
        Calculate elapsed time since user activity timer was started.

        Args:
            user_id (str): The ID of the user to get elapsed time for

        Returns:
            float: The elapsed time in seconds since timer start, or 0 if no timer exists
        """
        start_time = self.master_time_dict.get(user_id)
        if not start_time:
            return 0
        return time.perf_counter() - start_time

    @raise_exception(
        "Failed to validate user activity.",
        exception_logger=logger,
    )
    def init_validate_existing_user_activity(self) -> None:
        """
        Initialize continuous user activity validation with threading.

        Starts a recursive timer thread that periodically checks all active user
        sessions for inactivity and terminates sessions exceeding the threshold.
        """
        for user_id in list(self.master_time_dict.keys()):
            elapsed_time = self._get_elapsed_time(user_id)
            if elapsed_time > TIMER_THRESHOLD:
                logger.warning(
                    f"User session terminated due to inactivity - user_id: {user_id}, elapsed_time: {elapsed_time:.2f}s"
                )
                self._kill_user_session(user_id=user_id)
        thread = threading.Timer(
            TIMER_THREADING_INTERVAL,
            self.init_validate_existing_user_activity,
        )
        thread.start()

    @raise_exception(
        "Failed to restart user timer.",
        exception_logger=logger,
    )
    def restart_timer(self, user_id: str) -> None:
        """
        Restart the activity timer for a specific user.

        Updates the user's activity timer with the current timestamp, effectively
        resetting their inactivity countdown.

        Args:
            user_id (str): The ID of the user to restart the timer for
        """
        logger.info(f"[ SHARED-LIB ] Restarting activity timer for user_id: {user_id}")
        self.master_time_dict.update({user_id: time.perf_counter()})
