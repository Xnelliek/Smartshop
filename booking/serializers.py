from rest_framework import serializers
from .models import Booking, BookingSettings, BookingPayment
from shops.models import Shop, ShopService
from accounts.models import User
from shops.serializers import ShopSerializer, ShopServiceSerializer
from accounts.serializers import UserSerializer
from django.utils import timezone
from datetime import timedelta


class BookingSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingSettings
        fields = '__all__'


class BookingPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingPayment
        fields = [
            'id', 'amount', 'payment_method', 'transaction_id',
            'payment_date', 'status'
        ]


class BookingSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(),
        source='shop',
        write_only=True
    )
    service = ShopServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=ShopService.objects.all(),
        source='service',
        write_only=True
    )
    staff = UserSerializer(read_only=True)
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='staff',
        write_only=True,
        required=False,
        allow_null=True
    )
    payment = BookingPaymentSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'shop', 'shop_id',
            'service', 'service_id', 'staff', 'staff_id',
            'start_time', 'end_time', 'status', 'notes',
            'cancellation_reason', 'price', 'discount',
            'payment_status', 'payment', 'created_at'
        ]
        read_only_fields = ['customer', 'payment_status', 'payment']

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        service = data.get('service')  # Comes from service_id via `source='service'`

        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError("End time must be after start time.")

            if start_time < timezone.now() + timedelta(minutes=15):
                raise serializers.ValidationError("Booking must be made at least 15 minutes in advance.")

            if service:
                service_duration = timedelta(minutes=service.duration)
                booking_duration = end_time - start_time
                if abs(booking_duration - service_duration) > timedelta(minutes=5):
                    raise serializers.ValidationError(
                        f"Booking duration should be approximately {service.duration} minutes."
                    )

        return data


class AvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    shop = serializers.PrimaryKeyRelatedField(queryset=Shop.objects.all())
    service = serializers.PrimaryKeyRelatedField(queryset=ShopService.objects.all())
    staff = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
