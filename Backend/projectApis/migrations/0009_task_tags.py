# Generated migration for adding tags field to Task model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projectApis', '0008_add_sprint_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='tags',
            field=models.JSONField(blank=True, default=list, help_text='Task tags like design, frontend, backend, etc.'),
        ),
    ]
