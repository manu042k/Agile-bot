from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=100,blank=False)
    description = models.TextField()
    visibility = models.CharField(
        max_length=50,
        choices=[
            ('public', 'Public'),
            ('private', 'Private'),
        ],
        default='public'
    )
    team = models.ForeignKey('users.Team', on_delete=models.CASCADE, blank=True, null=True)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name