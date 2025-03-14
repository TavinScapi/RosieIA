import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime
import pytz  # Biblioteca para fuso horário (instale com: pip install pytz)
import sys

# Garante que a saída use UTF-8
sys.stdout.reconfigure(encoding='utf-8')


# Carregar variáveis de ambiente
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro-latest")

def obter_data_e_hora():
    # Definir o fuso horário desejado (exemplo: 'America/Sao_Paulo' para São Paulo)
    fuso_horario = pytz.timezone("America/Sao_Paulo")
    
    # Obter a data e hora no fuso horário correto
    now = datetime.now(fuso_horario)
    return now.strftime("%d/%m/%Y %H:%M:%S")

def obter_clima(cidade):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={cidade}&appid={WEATHER_API_KEY}&lang=pt&units=metric"
    try:
        response = requests.get(url)
        data = response.json()
        if data["cod"] != 200:
            return "Não consegui obter as informações do clima, senhor."
        temperatura = data["main"]["temp"]
        descricao = data["weather"][0]["description"]
        return f"O clima em {cidade} está {descricao} com temperatura de {temperatura}°C."
    except Exception:
        return "Houve um erro ao buscar as informações do clima."

def generate_response(prompt):
    try:
        # Gerando a resposta com o modelo
        input_text = f"Rosie, a assistente virtual amigável, responda de forma calorosa e atenciosa: {prompt}"
        output = model.generate_content(input_text)

        if output and output.text:
            # Extraindo a resposta gerada e removendo espaços extras
            resposta = output.text.strip()

            # Se a pergunta for uma saudação ou algo genérico como "Tudo bem?", não adiciona o toque extra
            saudações = ["Oi", "Olá", "Tudo bem", "Como vai", "Como você está"]
            if any(saudacao in resposta for saudacao in saudações):
                return resposta  # Responde com o que o modelo gerou sem adicionar mais nada

            # Caso a resposta seja uma informação concreta, adiciona o toque amigável
            resposta = f"Oi! Aqui está o que encontrei para você: {resposta}\nEstou sempre por aqui para ajudar 😊"
            
            return resposta
        
        return "Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente mais tarde. 😔"
    except Exception as e:
        return f"Oi! Algo deu errado ao processar sua solicitação. Erro: {str(e)} 😕"

