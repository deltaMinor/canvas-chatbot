from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin


class AnonymousAsAuthenticatedMiddleware(MiddlewareMixin):
    """
    Middleware that treats `AnonymousUser` as authenticated for specific purposes.
    """

    def process_request(self, request):
        # Check if the user is an instance of AnonymousUser
        if isinstance(request.user, AnonymousUser):
            # Add a custom attribute to simulate authentication
            request.user.is_active = True
            request.user.is_temp_authenticated = True
            return

        # Ensure the attribute is False for actual authenticated users
        request.user.is_active = False
        request.user.is_temp_authenticated = False
        return
