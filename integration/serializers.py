from rest_framework import serializers
from .models import IntegrationType, ShopIntegration, WebhookEndpoint, ApiCredential
from shops.serializers import ShopSerializer
from accounts.serializers import UserSerializer
from shops.models import Shop


class IntegrationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationType
        fields = ['id', 'name', 'description', 'logo', 'is_active', 'config_schema']

class ShopIntegrationSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True
    )
    integration_type = IntegrationTypeSerializer(read_only=True)
    integration_type_id = serializers.PrimaryKeyRelatedField(
        queryset=IntegrationType.objects.all(), 
        source='integration_type', 
        write_only=True
    )

    class Meta:
        model = ShopIntegration
        fields = [
            'id', 'shop', 'shop_id', 'integration_type', 'integration_type_id',
            'is_active', 'config', 'last_sync', 'sync_status', 'last_error'
        ]

    def validate(self, data):
        if 'shop_id' in data and data['shop_id']:
            shop = data['shop_id']
            if shop.owner != self.context['request'].user:
                raise serializers.ValidationError(
                    {"shop_id": "You don't own this shop."}
                )
        return data

class WebhookEndpointSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), 
        source='shop', 
        write_only=True
    )

    class Meta:
        model = WebhookEndpoint
        fields = ['id', 'shop', 'shop_id', 'name', 'url', 'is_active', 'secret_key', 'events']

    def validate(self, data):
        if 'shop_id' in data and data['shop_id']:
            shop = data['shop_id']
            if shop.owner != self.context['request'].user:
                raise serializers.ValidationError(
                    {"shop_id": "You don't own this shop."}
                )
        return data

class ApiCredentialSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = ApiCredential
        fields = ['id', 'owner', 'name', 'api_key', 'is_active', 'permissions', 'last_used']
        read_only_fields = ['owner', 'api_key']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)