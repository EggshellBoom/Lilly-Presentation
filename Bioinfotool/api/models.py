from django.db import models
import random
import string


def generate_unique_code():
    length = 6

    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        if Sequence.objects.filter(seq_id=code).count() == 0:
            break

    return code

# Create your models here.
class Sequence(models.Model):
    seq_id = models.CharField(max_length=8, default=generate_unique_code)
    session = models.CharField(max_length=50)
    label = models.CharField(default="no label", max_length=50)
    SEQ_TYPES = [
        ('DNA', 'DNA'),
        ('RNA', 'RNA')
    ]
    seq_type = models.CharField(max_length=3, choices=SEQ_TYPES, default='D')
    sequence = models.CharField(default="", max_length=2000)
    created_at = models.DateField(auto_now=True)

