from django.http import HttpResponse


def get_health_check_middleware(PREFIX: str):
    def health_check_middleware(get_response):
        def middleware(request):
            if request.path == f"{PREFIX}/health":
                return HttpResponse("OK!")
            return get_response(request)

        return middleware

    return health_check_middleware
