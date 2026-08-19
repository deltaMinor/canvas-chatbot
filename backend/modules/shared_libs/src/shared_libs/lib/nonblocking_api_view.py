from asgiref.sync import sync_to_async
from rest_framework.views import APIView


class NonBlockingAPIView(APIView):
    view_is_async = True

    async def dispatch(self, request, *args, **kwargs):
        return await sync_to_async(super().dispatch, thread_sensitive=False)(
            request,
            *args,
            **kwargs,
        )
