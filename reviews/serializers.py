from rest_framework import serializers
from .models import Review, ReviewMedia
from shops.serializers import ShopSerializer
from accounts.serializers import UserSerializer
from booking.serializers import BookingSerializer
from shops.models import Shop
from booking.models import Booking


class ReviewMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewMedia
        fields = ['id', 'file', 'media_type', 'caption', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True
    )
    booking = BookingSerializer(read_only=True)
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(), 
        source='booking', 
        write_only=True,
        required=False,
        allow_null=True
    )
    media = ReviewMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'customer', 'shop', 'shop_id', 'booking', 'booking_id',
            'rating', 'title', 'comment', 'is_verified', 'response',
            'response_date', 'media', 'created_at'
        ]
        read_only_fields = ['customer', 'is_verified', 'response_date']

    def validate(self, data):
        if 'booking' in data and data['booking']:
            if data['booking'].customer != self.context['request'].user:
                raise serializers.ValidationError(
                    {"booking": "You can only review your own bookings."}
                )
            if data['booking'].shop != data['shop']:
                raise serializers.ValidationError(
                    {"booking": "Booking doesn't belong to this shop."}
                )
        return data

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)