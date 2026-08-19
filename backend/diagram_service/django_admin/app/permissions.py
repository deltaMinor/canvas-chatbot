#         return self.handle_no_permission()

# class AllowAnonymousUserAccessMixin(AccessMixin):
#     """
#     Mixin that allows both authenticated users and `AnonymousUser` to access a view.
#     """

#     def dispatch(self, request, *args, **kwargs):
#         if (
#             isinstance(request.user, AnonymousUser)
#             or request.user.is_authenticated
#         ):
#             return super().dispatch(request, *args, **kwargs)
#         return self.handle_no_permission()
