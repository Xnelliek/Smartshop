from rest_framework import serializers
from .models import ShopCategory, Shop, ShopStaff, ShopService, ShopProduct
from accounts.serializers import UserSerializer
from core.serializers import AddressSerializer
from core.models import Address  # Add this import
from shops.models import ShopCategory, Shop, ShopStaff, ShopService, ShopProduct
from accounts.serializers import UserSerializer
from core.serializers import AddressSerializer  # This might also be needed

from django.contrib.auth import get_user_model
from shops.models import Shop  # Add this import
from booking.models import Booking  # Also needed for the Booking field
from .models import Review, ReviewMedia

User = get_user_model()  # Gets your custom User model

class ShopCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopCategory
        fields = ['id', 'name', 'description', 'icon', 'image', 'is_active']

class ShopSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    category = ShopCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ShopCategory.objects.all(), 
        source='category', 
        write_only=True
    )
    address = AddressSerializer(read_only=True)
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(), 
        source='address', 
        write_only=True,
        required=False
    )

    class Meta:
        model = Shop
        fields = [
            'id', 'owner', 'name', 'description', 'category', 'category_id', 
            'address', 'address_id', 'logo', 'cover_image', 'phone', 'email', 
            'website', 'opening_hours', 'is_verified', 'rating', 'total_reviews', 
            'is_active', 'created_at'
        ]
        read_only_fields = ['owner', 'is_verified', 'rating', 'total_reviews']

class ShopStaffSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True
    )
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user', 
        write_only=True
    )

    class Meta:
        model = ShopStaff
        fields = ['id', 'shop', 'shop_id', 'user', 'user_id', 'role', 'permissions', 'is_active']

class ShopServiceSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True
    )

    class Meta:
        model = ShopService
        fields = ['id', 'shop', 'shop_id', 'name', 'description', 'duration', 'price', 'is_active']

class ShopProductSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True
    )

    class Meta:
        model = ShopProduct
        fields = ['id', 'shop', 'shop_id', 'name', 'description', 'price', 'stock', 'category', 'is_active']