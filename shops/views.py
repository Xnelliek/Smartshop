from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import ShopCategory, Shop, ShopStaff, ShopService, ShopProduct
from .serializers import (ShopCategorySerializer, ShopSerializer, ShopStaffSerializer, 
                         ShopServiceSerializer, ShopProductSerializer)
from accounts.models import User
from django.shortcuts import get_object_or_404
from mixins import ShopOwnerQuerysetMixin


class ShopCategoryViewSet(viewsets.ModelViewSet):
    queryset = ShopCategory.objects.all()
    serializer_class = ShopCategorySerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_verified', 'owner']
    search_fields = ['name', 'description']
    ordering_fields = ['rating', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import NotAuthenticated
            raise NotAuthenticated("Authentication required to create a shop.")
        serializer.save(owner=self.request.user)

#    def perform_create(self, serializer):
#        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_staff(self, request, pk=None):
        shop = self.get_object()
        if not request.user.is_authenticated:
            from rest_framework.exceptions import NotAuthenticated
            raise NotAuthenticated("Login required to add staff.")
        if shop.owner != request.user:
            return Response(
                {"error": "You don't have permission to add staff to this shop."},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        role = request.data.get('role', 'staff')
        permissions_list = request.data.get('permissions', [])

        user = get_object_or_404(User, pk=user_id)
        staff_member, created = ShopStaff.objects.get_or_create(
            shop=shop,
            user=user,
            defaults={'role': role, 'permissions': permissions_list}
        )

        if not created:
            staff_member.role = role
            staff_member.permissions = permissions_list
            staff_member.save()

        serializer = ShopStaffSerializer(staff_member)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ShopStaffViewSet(ShopOwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = ShopStaff.objects.all().order_by('-id')
    serializer_class = ShopStaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shop', 'user', 'role']


class ShopServiceViewSet(ShopOwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = ShopService.objects.all()
    serializer_class = ShopServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['shop', 'is_active']
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class ShopProductViewSet(ShopOwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = ShopProduct.objects.all()
    serializer_class = ShopProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['shop', 'is_active', 'category']
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
