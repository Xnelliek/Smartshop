from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from shops.models import Shop
from core.models import BaseModel

User = get_user_model()

class IntegrationType(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField()
    logo = models.ImageField(upload_to='integration_logos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    config_schema = models.JSONField(default=dict)  # JSON schema for configuration

    def __str__(self):
        return self.name

class ShopIntegration(BaseModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='integrations')
    integration_type = models.ForeignKey(IntegrationType, on_delete=models.CASCADE, related_name='shop_integrations')
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict)  # Actual configuration data
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(max_length=20, default='idle')  # idle, in_progress, success, error
    last_error = models.TextField(blank=True)

    class Meta:
        unique_together = ('shop', 'integration_type')

    def __str__(self):
        return f"{self.shop.name} - {self.integration_type.name}"

class WebhookEndpoint(BaseModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='webhooks')
    name = models.CharField(max_length=100)
    url = models.URLField()
    is_active = models.BooleanField(default=True)
    secret_key = models.CharField(max_length=100)
    events = models.JSONField(default=list)  # List of events to listen for

    def __str__(self):
        return f"Webhook for {self.shop.name} - {self.name}"

class ApiCredential(BaseModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_credentials')
    name = models.CharField(max_length=100)
    api_key = models.CharField(max_length=100)
    api_secret = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    permissions = models.JSONField(default=list)
    last_used = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"API Credential for {self.owner.username} - {self.name}"