from rest_framework import serializers
from .models import MediaItem, MediaCollection
from shops.serializers import ShopSerializer
from accounts.serializers import UserSerializer
from shops.models import Shop

class MediaItemSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = MediaItem
        fields = [
            'id', 'owner', 'shop', 'shop_id', 'file', 'media_type',
            'title', 'description', 'tags', 'is_public', 'created_at'
        ]
        read_only_fields = ['owner', 'media_type']

    def validate(self, data):
        if 'shop_id' in data and data['shop_id']:
            shop = data['shop_id']
            if shop.owner != self.context['request'].user:
                raise serializers.ValidationError(
                    {"shop_id": "You don't own this shop."}
                )
        return data

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class MediaCollectionSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True,
        required=False,
        allow_null=True
    )
    items = MediaItemSerializer(many=True, read_only=True)
    item_ids = serializers.PrimaryKeyRelatedField(
        queryset=MediaItem.objects.all(),
        source='items',
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = MediaCollection
        fields = [
            'id', 'owner', 'shop', 'shop_id', 'title', 'description',
            'items', 'item_ids', 'is_public', 'created_at'
        ]
        read_only_fields = ['owner']

    def validate(self, data):
        if 'shop_id' in data and data['shop_id']:
            shop = data['shop_id']
            if shop.owner != self.context['request'].user:
                raise serializers.ValidationError(
                    {"shop_id": "You don't own this shop."}
                )
        
        if 'items' in data and data['items']:
            for item in data['items']:
                if item.owner != self.context['request'].user:
                    raise serializers.ValidationError(
                        {"items": f"You don't own media item {item.id}."}
                    )
        return data

    def create(self, validated_data):
        items = validated_data.pop('items', [])
        validated_data['owner'] = self.context['request'].user
        collection = super().create(validated_data)
        collection.items.set(items)
        return collection