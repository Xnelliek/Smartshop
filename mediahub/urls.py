from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'media-items', views.MediaItemViewSet, basename='mediaitem')
router.register(r'media-collections', views.MediaCollectionViewSet, basename='mediacollection')

urlpatterns = [
    path('', include(router.urls)),
]