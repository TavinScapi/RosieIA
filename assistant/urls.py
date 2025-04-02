from django.urls import path
from .views import rosie_response, blob_animation  # Importando a view blob_animation

urlpatterns = [
    path("rosie/", rosie_response, name="rosie_response"),
    path('blob/', blob_animation, name='blob_animation'),
]
