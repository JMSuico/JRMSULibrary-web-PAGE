# Generated idempotent schema verification & repair migration.
# Ensures Document Knowledge & OCR columns exist even on databases where
# migration 0036 was previously recorded without altering all columns.

from django.db import migrations

from Features.Helpers.schema_helpers import ensure_document_knowledge_columns


class Migration(migrations.Migration):

    dependencies = [
        ("Features", "0036_add_document_knowledge_ocr_fields"),
    ]

    operations = [
        migrations.RunPython(
            ensure_document_knowledge_columns,
            migrations.RunPython.noop,
        ),
    ]
