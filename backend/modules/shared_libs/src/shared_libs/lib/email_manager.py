import logging
from typing import Any

from python_http_client.client import Client, Response
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class EmailManager:
    """Service for sending emails using the SendGrid API.

    This service uses a SendGrid client to send emails. It provides a method
    for sending password reset emails with a given reset URL.

    Attributes:
        sendgrid_client (SendGridAPIClient): The SendGrid client to use for sending emails.
    """

    def __init__(
        self,
        sendgrid_client: SendGridAPIClient,
    ):
        self.sendgrid_client = sendgrid_client

    @raise_exception(
        "Failed to send email.",
        exception_logger=logger,
    )
    def send_email(
        self,
        user_email: str,
        reset_url: str,
        email_subject: str,
        from_email: str,
        template_id: str,
    ) -> Any | Response | Client:
        """
        Sends an email to a given email address with a given subject and reset URL.

        Args:
            user_email (str): The email address to send the email to.
            reset_url (str): The reset URL to include in the email.
            email_subject (str): The subject of the email. Defaults to "Requested a password reset".
            from_email (str): The email address to send the email from. Defaults to FROM_EMAIL.
            template_id (str): The ID of the SendGrid dynamic template to use for the email content. Defaults to TEMPLATE_ID.

        Returns:
            Any | Response | Client: The response from the SendGrid API.

        Raises:
            Exception: If the email sending fails.
        """
        message = Mail(
            from_email=from_email,
            to_emails=user_email,
            subject=email_subject,
        )
        message.dynamic_template_data = {"reset_url": reset_url}
        message.template_id = template_id
        return self.sendgrid_client.send(message)

    @raise_exception(
        "Failed to send email.",
        exception_logger=logger,
    )
    def send_plaintext_email(
        self,
        email_subject: str,
        plain_text_content: str,
        to_email: str,
        from_email: str,
    ) -> Any | Response | Client:
        """
        Sends a feedback email using SendGrid.

        Args:
            email_subject (str): The subject of the email.
            plain_text_content (str): The content of the email in plain text.
            to_email (str): The recipient's email address. Defaults to TO_EMAIL.
            from_email (str): The sender's email address. Defaults to FROM_EMAIL.

        Returns:
            Any | Response | Client: The response from the SendGrid client after attempting to send the email.
        """
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=email_subject,
            plain_text_content=plain_text_content,
        )
        return self.sendgrid_client.send(message)
