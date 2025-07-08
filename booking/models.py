from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from shops.models import Shop, ShopService
from core.models import BaseModel

User = get_user_model()


class Booking(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        CONFIRMED = 'confirmed', _('Confirmed')
        COMPLETED = 'completed', _('Completed')
        CANCELLED = 'cancelled', _('Cancelled')
        NO_SHOW = 'no_show', _('No Show')

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(ShopService, on_delete=models.CASCADE, related_name='bookings')
    staff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_bookings')

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.BooleanField(default=False)

    def __str__(self):
        return f"Booking #{self.id} at {self.shop.name}"


class BookingSettings(models.Model):
    shop = models.OneToOneField(Shop, on_delete=models.CASCADE, related_name='booking_settings')
    
    slot_duration = models.PositiveIntegerField(default=30, help_text="Duration in minutes per slot")
    min_booking_notice = models.PositiveIntegerField(default=120, help_text="Minimum notice (minutes) before booking")
    max_booking_notice = models.PositiveIntegerField(default=4320, help_text="Max future booking window (in minutes)")
    buffer_time = models.PositiveIntegerField(default=15, help_text="Buffer (minutes) between bookings")
    concurrent_bookings = models.PositiveIntegerField(default=1, help_text="Allowed concurrent bookings per slot")
    
    available_days = models.JSONField(default=list, help_text="List of available weekdays (0=Mon, 6=Sun)")

    def __str__(self):
        return f"Booking settings for {self.shop.name}"


class BookingPayment(BaseModel):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    
    status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f"Payment for Booking #{self.booking.id}"
