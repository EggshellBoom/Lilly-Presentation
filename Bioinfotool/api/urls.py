"""Bioinfotool URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from .views import CreateSequenceView, SequenceView, UpdateSequenceView,AnalyzeSequenceView, BlastSequenceView, AlignSequenceView,TreeSequenceView, BreastCancerView, SkinCancerView


urlpatterns = [
    path('viewSequence', SequenceView.as_view()),
    path('createSequence', CreateSequenceView.as_view()),
    path('updateSequence', UpdateSequenceView.as_view()),
    path('analyzeSequences', AnalyzeSequenceView.as_view()),
    path('blastSequences', BlastSequenceView.as_view()),
    path('alignSequences', AlignSequenceView.as_view()),
    path('treeSequences', TreeSequenceView.as_view()),
    path('breastCancer', BreastCancerView.as_view()),
    path('skinCancer', SkinCancerView.as_view())
]
