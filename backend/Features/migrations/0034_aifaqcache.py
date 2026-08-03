from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('Features', '0033_supabase_security_lockdown'),
    ]

    operations = [
        migrations.CreateModel(
            name='AIFaqCache',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(db_index=True, max_length=500, unique=True)),
                ('answers', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('last_accessed', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'AI FAQ Cache',
                'verbose_name_plural': 'AI FAQ Caches',
                'db_table': 'ai_faq_cache',
                'ordering': ['-last_accessed'],
            },
        ),
    ]
