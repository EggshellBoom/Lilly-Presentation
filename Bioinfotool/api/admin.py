from django.contrib import admin

# Register your models here.
from .models import Image,Sequence



admin.site.register(Image)
admin.site.register(Sequence)