# Generated migration for adding UUID to Sprint and Document models

import uuid
from django.db import migrations, models


def generate_sprint_uuids(apps, schema_editor):
    """Generate UUIDs for existing sprints"""
    Sprint = apps.get_model('projectApis', 'Sprint')
    for sprint in Sprint.objects.all():
        sprint.uuid = uuid.uuid4()
        sprint.save(update_fields=['uuid'])


def generate_document_uuids(apps, schema_editor):
    """Generate UUIDs for existing documents"""
    Document = apps.get_model('projectApis', 'Document')
    for document in Document.objects.all():
        document.uuid = uuid.uuid4()
        document.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('projectApis', '0004_alter_project_id'),
    ]

    operations = [
        # Add UUID to Sprint
        migrations.AddField(
            model_name='sprint',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.RunPython(generate_sprint_uuids, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='sprint',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True),
        ),
        migrations.AlterField(
            model_name='sprint',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
        
        # Add UUID to Document
        migrations.AddField(
            model_name='document',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.RunPython(generate_document_uuids, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='document',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True),
        ),
        migrations.AlterField(
            model_name='document',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
