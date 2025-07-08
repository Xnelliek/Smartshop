from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.timezone import make_aware
from datetime import datetime, timedelta

from .models import Booking, BookingSettings, BookingPayment
from .serializers import BookingSerializer, BookingSettingsSerializer, AvailabilitySerializer

from shops.models import Shop, ShopService
from accounts.models import User
from django.shortcuts import get_object_or_404

from mixins import SafeQuerysetMixin  # ✅ Import the mixin


class BookingViewSet(SafeQuerysetMixin, viewsets.ModelViewSet):  # ✅ Apply mixin here
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shop', 'service', 'status', 'customer', 'staff']

def get_queryset(self):
    user = self.request.user
    queryset = super().get_queryset()

    if not user.is_authenticated or getattr(self, 'swagger_fake_view', False):
        return self.queryset.none()

    if hasattr(user, 'role'):  # Prevents crashes if role is missing
        if user.role == 'CUSTOMER':
            return queryset.filter(customer=user)
        elif user.role == 'VENDOR':
            return queryset.filter(shop__owner=user)
        elif user.role == 'STAFF':
            return queryset.filter(staff=user)

    return queryset.none()

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        reason = request.data.get('reason', '')

        if booking.customer != request.user and booking.shop.owner != request.user:
            return Response(
                {"error": "You don't have permission to cancel this booking."},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status == 'cancelled':
            return Response(
                {"error": "This booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = 'cancelled'
        booking.cancellation_reason = reason
        booking.save()

        return Response(
            {"message": "Booking cancelled successfully."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def availability(self, request):
        serializer = AvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data['date']
        shop = serializer.validated_data['shop']
        service = serializer.validated_data['service']
        staff = serializer.validated_data.get('staff')

        try:
            settings = shop.booking_settings
        except BookingSettings.DoesNotExist:
            return Response(
                {"error": "Booking settings not configured for this shop."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all bookings for the selected day
        start_of_day = make_aware(datetime.combine(date, datetime.min.time()))
        end_of_day = make_aware(datetime.combine(date, datetime.max.time()))

        bookings = Booking.objects.filter(
            shop=shop,
            start_time__gte=start_of_day,
            end_time__lte=end_of_day,
            status__in=['confirmed', 'pending']
        )

        if staff:
            bookings = bookings.filter(staff=staff)

        # Generate available slots
        slot_duration = timedelta(minutes=settings.slot_duration)
        service_duration = timedelta(minutes=service.duration)
        buffer_time = timedelta(minutes=settings.buffer_time)

        opening_time = make_aware(datetime.combine(date, datetime.strptime('09:00', '%H:%M').time()))
        closing_time = make_aware(datetime.combine(date, datetime.strptime('18:00', '%H:%M').time()))

        current_time = opening_time
        available_slots = []

        while current_time + service_duration <= closing_time:
            slot_end = current_time + service_duration
            is_available = True

            for booking in bookings:
                if (
                    current_time < booking.end_time + buffer_time and
                    slot_end + buffer_time > booking.start_time
                ):
                    is_available = False
                    break

            if is_available:
                available_slots.append({
                    'start_time': current_time,
                    'end_time': slot_end
                })

            current_time += slot_duration

        return Response({
            'date': date,
            'shop': shop.id,
            'service': service.id,
            'available_slots': available_slots
        })


class BookingSettingsViewSet(SafeQuerysetMixin, viewsets.ModelViewSet):  # ✅ Apply mixin here too
    queryset = BookingSettings.objects.all()
    serializer_class = BookingSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
    
        if not user.is_authenticated or getattr(self, 'swagger_fake_view', False):
            return self.queryset.none()
    
        if hasattr(user, 'role') and user.role == 'VENDOR':
            return queryset.filter(shop__owner=user)
    
        return queryset.none()
