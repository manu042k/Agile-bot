# Generated migration for adding UUID to Project model

import uuid
from django.db import migrations, models


def generate_uuids(apps, schema_editor):
    """Generate UUIDs for existing projects"""
    Project = apps.get_model('projectApis', 'Project')
    for project in Project.objects.all():
        project.uuid = uuid.uuid4()
        project.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('projectApis', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.RunPython(generate_uuids, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='project',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True),
        ),
    ]
