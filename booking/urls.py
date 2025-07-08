from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, BookingSettingsViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'settings', BookingSettingsViewSet, basename='booking-settings')

urlpatterns = [
    path('', include(router.urls)),
]
