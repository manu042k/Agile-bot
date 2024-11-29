# Generated by Django 4.2.16 on 2024-11-29 06:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('projectApis', '0003_alter_project_created_by_alter_project_team'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='team',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='users.team'),
        ),
    ]