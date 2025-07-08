from django.db.models import QuerySet
from django.core.exceptions import ImproperlyConfigured


class SafeQuerysetMixin:
    """
    Prevents get_queryset from breaking in Swagger or for unauthenticated users.
    Used to avoid 'AnonymousUser' errors during schema generation.
    """
    def get_queryset(self) -> QuerySet:
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return self.queryset.none()
        return super().get_queryset()


class ShopOwnerQuerysetMixin:
    """
    Filters queryset so shop owners only access their own records.
    Supports models with 'owner', 'shop__owner', or 'user' fields.
    """
    def get_queryset(self) -> QuerySet:
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.none()

        user = self.request.user
        if not user or not user.is_authenticated:
            return self.queryset.none()

        try:
            base_queryset = super().get_queryset()
        except AttributeError:
            if hasattr(self, 'queryset'):
                base_queryset = self.queryset
            elif hasattr(self, 'model'):
                base_queryset = self.model.objects.all()
            else:
                raise ImproperlyConfigured("Define 'queryset' or 'model' in your view.")

        if user.user_type == 'admin' or user.is_superuser:
            return base_queryset

        if user.user_type == 'shop_owner':
            model = base_queryset.model
            if hasattr(model, 'owner'):
                return base_queryset.filter(owner=user).distinct()
            elif hasattr(model, 'shop') and hasattr(model._meta.get_field('shop').related_model, 'owner'):
                return base_queryset.filter(shop__owner=user).distinct()

        if hasattr(base_queryset.model, 'user'):
            return base_queryset.filter(user=user).distinct()

        return base_queryset.none()
