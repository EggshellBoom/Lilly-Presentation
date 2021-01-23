from rest_framework import serializers
from .models import Sequence,Image


class SequenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sequence
        fields = ('id','seq_id','session','label','seq_type','sequence','created_at')

class CreateSequenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sequence
        fields = ('label','seq_type','sequence','created_at')

class UpdateSequenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sequence
        fields = ('seq_id','label','seq_type','sequence','created_at')

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'