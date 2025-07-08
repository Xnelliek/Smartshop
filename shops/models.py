from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from core.models import BaseModel, Address

User = get_user_model()

class ShopCategory(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to='shop_categories/', null=True, blank=True)

    def __str__(self):
        return self.name

class Shop(BaseModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shops')
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(ShopCategory, on_delete=models.SET_NULL, null=True, related_name='shops')
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    logo = models.ImageField(upload_to='shop_logos/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='shop_covers/', null=True, blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True)
    opening_hours = models.JSONField(default=dict)  # {'monday': {'open': '09:00', 'close': '18:00'}, ...}
    is_verified = models.BooleanField(default=False)
    rating = models.FloatField(default=0)
    total_reviews = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class ShopStaff(BaseModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='staff')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shop_staff')
    role = models.CharField(max_length=50)  # manager, staff, etc.
    permissions = models.JSONField(default=list)  # List of permissions for this staff member

    class Meta:
        unique_together = ('shop', 'user')

    def __str__(self):
        return f"{self.user.username} at {self.shop.name}"

class ShopService(BaseModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} at {self.shop.name}"

class ShopProduct(BaseModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} at {self.shop.name}"

        # Add this at the bottom of your shops/models.py

class Review(BaseModel):
    #shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='reviews')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='staff_reviews')  # or any unique name

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shop_reviews')
    rating = models.PositiveSmallIntegerField()  # Usually between 1–5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('shop', 'user')  # One review per user per shop

    def __str__(self):
        return f"Review by {self.user.username} for {self.shop.name}"

class ReviewMedia(BaseModel):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='media')
    media_file = models.FileField(upload_to='review_media/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Media for Review ID {self.review.id}"
