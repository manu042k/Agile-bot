"""
Signals for automatic file cleanup
Handles both local storage and Azure Blob Storage
"""
import os
import logging
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import Document, FileUpload

logger = logging.getLogger(__name__)


def delete_file_from_storage(file_field):
    """
    Delete file from storage (local or Azure)
    
    Args:
        file_field: Django FileField instance
    """
    if not file_field:
        return
    
    try:
        # Check if using Azure storage
        if hasattr(settings, 'USE_AZURE_STORAGE') and settings.USE_AZURE_STORAGE:
            # Azure storage will handle deletion through the storage backend
            file_field.delete(save=False)
            logger.info(f"Deleted file from Azure storage: {file_field.name}")
        else:
            # Local file system
            if os.path.isfile(file_field.path):
                os.remove(file_field.path)
                logger.info(f"Deleted local file: {file_field.path}")
                
                # Try to remove empty parent directories
                try:
                    parent_dir = os.path.dirname(file_field.path)
                    if os.path.isdir(parent_dir) and not os.listdir(parent_dir):
                        os.rmdir(parent_dir)
                        logger.info(f"Removed empty directory: {parent_dir}")
                except Exception:
                    pass  # Ignore errors when removing directories
                    
    except Exception as e:
        logger.error(f"Error deleting file {file_field.name}: {str(e)}")


@receiver(post_delete, sender=Document)
def delete_document_file(sender, instance, **kwargs):
    """
    Delete the actual file from storage when a Document is deleted
    """
    delete_file_from_storage(instance.file)


@receiver(post_delete, sender=FileUpload)
def delete_fileupload_file(sender, instance, **kwargs):
    """
    Delete the actual file from storage when a FileUpload is deleted
    """
    delete_file_from_storage(instance.file)
