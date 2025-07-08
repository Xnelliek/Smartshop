from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from .models import Review, ReviewMedia
from .serializers import ReviewSerializer, ReviewMediaSerializer
from shops.models import Shop
from booking.models import Booking
from django.shortcuts import get_object_or_404

from mixins import SafeQuerysetMixin  # ✅ Import the mixin


class ReviewViewSet(SafeQuerysetMixin, viewsets.ModelViewSet):  # ✅ Apply mixin
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shop', 'customer', 'rating', 'is_verified']

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['add_response']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
    
        if not user.is_authenticated or getattr(self, 'swagger_fake_view', False):
            return self.queryset.none()
    
        if getattr(user, 'user_type', None) == 'shop_owner':
            return super().get_queryset().filter(shop__owner=user)
    
        return super().get_queryset()
    
#    def get_queryset(self):
#        queryset = super().get_queryset()
#        if self.request.user.is_authenticated and self.request.user.user_type == 'shop_owner':
#            return queryset.filter(shop__owner=self.request.user)
#        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_response(self, request, pk=None):
        review = self.get_object()
        if review.shop.owner != request.user:
            return Response(
                {"error": "You don't have permission to respond to this review."},
                status=status.HTTP_403_FORBIDDEN
            )

        response_text = request.data.get('response', '')
        if not response_text:
            return Response(
                {"error": "Response text is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        review.response = response_text
        review.response_date = timezone.now()
        review.save()

        return Response(
            {"message": "Response added successfully."},
            status=status.HTTP_200_OK
        )


class ReviewMediaViewSet(SafeQuerysetMixin, viewsets.ModelViewSet):  # ✅ Apply mixin
    queryset = ReviewMedia.objects.all()
    serializer_class = ReviewMediaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
    
        if not user.is_authenticated or getattr(self, 'swagger_fake_view', False):
            return self.queryset.none()
    
        if getattr(user, 'user_type', None) == 'shop_owner':
            return super().get_queryset().filter(review__shop__owner=user)
    
        return super().get_queryset().filter(review__customer=user)
    
#    def get_queryset(self):
#        queryset = super().get_queryset()
#        if self.request.user.user_type == 'shop_owner':
#            return queryset.filter(review__shop__owner=self.request.user)
#        return queryset.filter(review__customer=self.request.user)

    def perform_create(self, serializer):
        review_id = self.request.data.get('review')
        review = get_object_or_404(Review, pk=review_id)
        if review.customer != self.request.user:
            raise PermissionDenied("You can only add media to your own reviews.")
        serializer.save(review=review)
