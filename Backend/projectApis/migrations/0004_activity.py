# Generated migration for Activity model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projectApis', '0003_remove_task_assigned_to_task_assigned_to'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('activity_type', models.CharField(
                    choices=[
                        ('task_created', 'Task Created'),
                        ('task_updated', 'Task Updated'),
                        ('task_completed', 'Task Completed'),
                        ('task_assigned', 'Task Assigned'),
                        ('task_deleted', 'Task Deleted'),
                        ('comment_added', 'Comment Added'),
                        ('project_created', 'Project Created'),
                        ('project_updated', 'Project Updated'),
                        ('project_deleted', 'Project Deleted'),
                        ('document_uploaded', 'Document Uploaded'),
                        ('member_added', 'Member Added'),
                        ('member_removed', 'Member Removed'),
                        ('team_created', 'Team Created'),
                        ('team_updated', 'Team Updated'),
                    ],
                    db_index=True,
                    max_length=50
                )),
                ('description', models.TextField(help_text='Human-readable description of the activity')),
                ('target_name', models.CharField(help_text='Name of the target object', max_length=255)),
                ('metadata', models.JSONField(blank=True, help_text='Additional data about the activity', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('project', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='activities',
                    to='projectApis.project'
                )),
                ('task', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='activities',
                    to='projectApis.task'
                )),
                ('user', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='activities',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'verbose_name_plural': 'Activities',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['-created_at'], name='projectApis_created_idx1'),
                    models.Index(fields=['activity_type', '-created_at'], name='projectApis_activity_idx1'),
                    models.Index(fields=['user', '-created_at'], name='projectApis_user_idx1'),
                    models.Index(fields=['project', '-created_at'], name='projectApis_project_idx1'),
                ],
            },
        ),
    ]

