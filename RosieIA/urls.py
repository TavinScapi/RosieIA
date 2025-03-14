from django.contrib import admin
from django.urls import include, path
from assistant.views import rosie_interface  # Importe a view para a página inicial

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("assistant.urls")),  # API para interações com o rosie
    path("", rosie_interface, name="rosie_home"),  # Página inicial
]
