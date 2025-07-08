from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'shop-categories', views.ShopCategoryViewSet, basename='shopcategory')
router.register(r'shops', views.ShopViewSet, basename='shop')
router.register(r'shop-staff', views.ShopStaffViewSet, basename='shopstaff')
router.register(r'shop-services', views.ShopServiceViewSet, basename='shopservice')
router.register(r'shop-products', views.ShopProductViewSet, basename='shopproduct')

urlpatterns = [
    path('', include(router.urls)),
]