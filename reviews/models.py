from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from shops.models import Shop
from booking.models import Booking
from core.models import BaseModel

User = get_user_model()

class Review(BaseModel):
    RATING_CHOICES = (
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    )
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='shop_reviews')

    #shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='review')
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified = models.BooleanField(default=False)
    response = models.TextField(blank=True)
    response_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('customer', 'shop', 'booking')

    def __str__(self):
        return f"Review by {self.customer.username} for {self.shop.name}"

class ReviewMedia(BaseModel):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='review_media/')
    media_type = models.CharField(max_length=20)  # image, video
    caption = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"Media for review #{self.review.id}"