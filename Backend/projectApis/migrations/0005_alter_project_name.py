# Generated by Django 4.2.16 on 2024-11-29 06:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projectApis', '0004_alter_project_team'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='name',
            field=models.CharField(max_length=100),
        ),
    ]