from rest_framework import serializers
from .models import Sequence


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