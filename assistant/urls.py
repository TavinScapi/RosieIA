from django.urls import path
from .views import rosie_response

urlpatterns = [
    path("rosie/", rosie_response, name="rosie_response"),
]

