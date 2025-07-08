from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from .models import MediaItem, MediaCollection
from .serializers import MediaItemSerializer, MediaCollectionSerializer
from shops.models import Shop

from mixins import SafeQuerysetMixin  # ✅ Import the mixin


class MediaItemViewSet(SafeQuerysetMixin, viewsets.ModelViewSet):  # ✅ Mixin added
    queryset = MediaItem.objects.all()
    serializer_class = MediaItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shop', 'media_type', 'is_public']

    def get_queryset(self):
        user = self.request.user
    
        if not user.is_authenticated or getattr(self, 'swagger_fake_view', False):
            return self.queryset.none()
    
        if hasattr(user, 'user_type') and user.user_type == 'shop_owner':
            return super().get_queryset().filter(owner=user)
    
        return super().get_queryset().filter(owner=user)
    
    @action(detail=False, methods=['get'])
    def my_media(self, request):
        queryset = self.get_queryset().filter(owner=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MediaCollectionViewSet(SafeQuerysetMixin, viewsets.ModelViewSet):  # ✅ Mixin added
    queryset = MediaCollection.objects.all()
    serializer_class = MediaCollectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shop', 'is_public']

    def get_queryset(self):
        user = self.request.user
    
        if not user.is_authenticated or getattr(self, 'swagger_fake_view', False):
            return self.queryset.none()
    
        if hasattr(user, 'user_type') and user.user_type == 'shop_owner':
            return super().get_queryset().filter(owner=user)
    
        return super().get_queryset().filter(owner=user)
    
    @action(detail=True, methods=['post'])
    def add_items(self, request, pk=None):
        collection = self.get_object()
        item_ids = request.data.get('item_ids', [])

        if not item_ids:
            return Response(
                {"error": "No item IDs provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        items = MediaItem.objects.filter(id__in=item_ids, owner=request.user)
        if items.count() != len(item_ids):
            return Response(
                {"error": "Some items don't exist or don't belong to you."},
                status=status.HTTP_400_BAD_REQUEST
            )

        collection.items.add(*items)
        return Response(
            {"message": f"Added {items.count()} items to collection."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def remove_items(self, request, pk=None):
        collection = self.get_object()
        item_ids = request.data.get('item_ids', [])

        if not item_ids:
            return Response(
                {"error": "No item IDs provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        items = MediaItem.objects.filter(id__in=item_ids)
        collection.items.remove(*items)
        return Response(
            {"message": f"Removed {len(item_ids)} items from collection."},
            status=status.HTTP_200_OK
        )
