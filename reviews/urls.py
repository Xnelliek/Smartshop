from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'review-media', views.ReviewMediaViewSet, basename='reviewmedia')

urlpatterns = [
    path('', include(router.urls)),
]