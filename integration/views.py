from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import IntegrationType, ShopIntegration, WebhookEndpoint, ApiCredential
from .serializers import (IntegrationTypeSerializer, ShopIntegrationSerializer, 
                         WebhookEndpointSerializer, ApiCredentialSerializer)
from shops.models import Shop
from django.shortcuts import get_object_or_404
import secrets
import string

class IntegrationTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IntegrationType.objects.filter(is_active=True)
    serializer_class = IntegrationTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class ShopIntegrationViewSet(viewsets.ModelViewSet):
    queryset = ShopIntegration.objects.all()
    serializer_class = ShopIntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shop', 'integration_type', 'is_active']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return self.queryset.none()
        return super().get_queryset().filter(shop__owner=self.request.user)

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        integration = self.get_object()
        # Here you would implement the actual sync logic with the external service
        # For now, we'll just simulate it
        integration.sync_status = 'in_progress'
        integration.save()
        
        # Simulate sync process
        import time
        time.sleep(2)
        
        integration.sync_status = 'success'
        integration.last_sync = timezone.now()
        integration.save()
        
        return Response(
            {"message": f"Sync completed for {integration.integration_type.name}"},
            status=status.HTTP_200_OK
        )

class WebhookEndpointViewSet(viewsets.ModelViewSet):
    queryset = WebhookEndpoint.objects.all()
    serializer_class = WebhookEndpointSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['shop', 'is_active']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return self.queryset.none()
        return super().get_queryset().filter(shop__owner=self.request.user)
    
    def perform_create(self, serializer):
        # Generate a random secret key
        alphabet = string.ascii_letters + string.digits
        secret_key = ''.join(secrets.choice(alphabet) for i in range(50))
        serializer.save(secret_key=secret_key)

class ApiCredentialViewSet(viewsets.ModelViewSet):
    queryset = ApiCredential.objects.all()
    serializer_class = ApiCredentialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return self.queryset.none()
        return super().get_queryset().filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        # Generate a random API key
        alphabet = string.ascii_letters + string.digits
        api_key = ''.join(secrets.choice(alphabet) for i in range(40))
        serializer.save(api_key=api_key)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        credential = self.get_object()
        alphabet = string.ascii_letters + string.digits
        credential.api_key = ''.join(secrets.choice(alphabet) for i in range(40))
        credential.save()
        return Response(
            {"message": "API key regenerated successfully."},
            status=status.HTTP_200_OK
        )