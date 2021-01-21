from django.urls import path
from .views import index



urlpatterns = [
    path('',index),
    path('alignment',index),
    path('analysis',index),
    path('phylogeny',index),
    path('entry',index),
    path('cancer',index)
]
