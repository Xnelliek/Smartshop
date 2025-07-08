from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'addresses', views.AddressViewSet, basename='address')
router.register(r'contact-messages', views.ContactMessageViewSet, basename='contactmessage')
router.register(r'system-configs', views.SystemConfigViewSet, basename='systemconfig')

urlpatterns = [
    path('', include(router.urls)),
]