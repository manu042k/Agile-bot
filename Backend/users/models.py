from django.contrib.auth.models import AbstractUser
from django.db import models

class AgileBotUser(AbstractUser):
    company_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username


class Team(models.Model):
    name = models.CharField(max_length=255)
    company = models.ForeignKey(AgileBotUser, related_name='company', on_delete=models.CASCADE)
    members = models.ManyToManyField(AgileBotUser, related_name='members')

    def __str__(self):
        return self.name
