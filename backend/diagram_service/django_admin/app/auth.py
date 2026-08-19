from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class CustomTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.META["HTTP_AUTHORIZATION"]
        if not token:
            return None  # No credentials provided

        if token != "YourCustomToken":  # Replace with your logic
            raise AuthenticationFailed("Invalid token")

        return (None, None)  # Return user and auth data if valid
