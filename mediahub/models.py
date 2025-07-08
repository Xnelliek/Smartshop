from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from shops.models import Shop
from core.models import BaseModel

User = get_user_model()

class MediaItem(BaseModel):
    MEDIA_TYPES = (
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
    )
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='media_items')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, null=True, blank=True, related_name='media_items')
    file = models.FileField(upload_to='media_items/')
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list)  # List of tags
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.media_type} - {self.title or self.file.name}"

class MediaCollection(BaseModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='media_collections')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, null=True, blank=True, related_name='media_collections')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    items = models.ManyToManyField(MediaItem, related_name='collections')
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return self.title