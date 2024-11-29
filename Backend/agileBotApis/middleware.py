import logging
import json
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class LoggingMiddleware(MiddlewareMixin):
    """
    Middleware for logging requests and responses.
    """
    def process_request(self, request):
        logger.info(f"Request: {request.method} {request.get_full_path()}")
        logger.info(f"Request body: {json.dumps(request.POST.dict(), indent=2)}")

    def process_response(self, request, response):
        logger.info(f"Response status: {response.status_code}")
        
        if response:
            logger.info(f"Response body: {response.body}")

        return response

    def process_exception(self, request, exception):
        logger.error(f"Exception: {str(exception)}")
        return JsonResponse(
            {'error': 'Internal Server Error', 'details': str(exception)},
            status=500
        )