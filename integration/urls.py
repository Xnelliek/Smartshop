from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'integration-types', views.IntegrationTypeViewSet, basename='integrationtype')
router.register(r'shop-integrations', views.ShopIntegrationViewSet, basename='shopintegration')
router.register(r'webhooks', views.WebhookEndpointViewSet, basename='webhook')
router.register(r'api-credentials', views.ApiCredentialViewSet, basename='apicredential')

urlpatterns = [
    path('', include(router.urls)),
]