from django.shortcuts import render
from django.http import JsonResponse
from .rosie import obter_data_e_hora, obter_clima, generate_response

def rosie_response(request):
    prompt = request.GET.get("prompt", "")
    
    if not prompt:
        return JsonResponse({"error": "Nenhuma entrada fornecida"}, status=400)

    if "hora" in prompt or "data" in prompt:
        resposta = obter_data_e_hora()
    elif "clima" in prompt or "tempo" in prompt:
        cidade = request.GET.get("cidade")
        resposta = obter_clima(cidade)
    else:
        resposta = generate_response(prompt)

    return JsonResponse({"response": resposta})

from django.shortcuts import render

def rosie_interface(request):
    return render(request, "index.html")

