let userCity = "São Paulo"; // Cidade padrão
let primeiraPergunta = true; // Variável para verificar se é a primeira pergunta

document.addEventListener("DOMContentLoaded", function () {
    // Focar automaticamente no input assim que a página carregar
    let input = document.getElementById("pergunta");
    input.focus();
});

async function obterCidadeUsuario() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            try {
                let res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                let data = await res.json();
                userCity = data.address.city || userCity;
            } catch (error) {
                console.error("Erro ao obter localização", error);
            }
        });
    }
}

function adicionarMensagem(texto, classe) {
    let chat = document.getElementById("chat");
    let mensagem = document.createElement("div");
    mensagem.classList.add("message", classe);
    mensagem.innerText = texto;
    chat.appendChild(mensagem);
    chat.scrollTop = chat.scrollHeight;
}

function adicionarAnimacaoDigitacao() {
    let chat = document.getElementById("chat");
    let typing = document.createElement("div");
    typing.id = "typing";
    typing.classList.add("typing");
    typing.innerText = "Rosie está digitando...";
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
}

function removerAnimacaoDigitacao() {
    let typing = document.getElementById("typing");
    if (typing) {
        typing.remove();
    }
}

function extrairCidade(prompt) {
    let regex = /(?:clima|tempo)\s+(?:em|de|da|do)\s+([\p{L}\s]+)/iu;
    let match = prompt.match(regex);
    return match ? match[1].trim() : userCity;
}

async function enviarPergunta() {
    let input = document.getElementById("pergunta");
    let btn = document.getElementById("btnEnviar");
    let prompt = input.value.trim();
    if (!prompt) return;

    // Esconder h1 e h3 após a primeira pergunta
    if (primeiraPergunta) {
        document.querySelector("h1").style.display = "none";
        document.querySelector("h3").style.display = "none";

        let inputContainer = document.querySelector(".input-container");
        let chatContainer = document.querySelector(".chat-container");
        let footer = document.querySelector("footer");

        // Fixando o input-container na parte inferior da tela
        inputContainer.style.position = "fixed";
        inputContainer.style.bottom = "30px";  // Distância do rodapé
        inputContainer.style.width = "100%";
        inputContainer.style.zIndex = "1000";

        // Ajustando o chat-container para não ser sobreposto
        chatContainer.style.marginBottom = "160px";  // Espaço extra para o input fixado

        // Diminuindo o tamanho do footer após a primeira pergunta
        footer.style.height = "10px";  // Ajusta a altura
        footer.style.fontSize = "12px";  // Diminui o tamanho da fonte
        footer.style.transition = "all 0.5s ease";  // Transição suave para todas as propriedades

        primeiraPergunta = false;
    }



    adicionarMensagem("Você: " + prompt, "user");
    input.value = "";
    btn.disabled = true;

    adicionarAnimacaoDigitacao();

    let cidade = extrairCidade(prompt);
    try {
        let response = await fetch(`/api/rosie/?prompt=${encodeURIComponent(prompt)}&cidade=${encodeURIComponent(cidade)}`);
        let data = await response.json();
        removerAnimacaoDigitacao();
        adicionarMensagem("Rosie: " + data.response, "bot");
    } catch (error) {
        removerAnimacaoDigitacao();
        adicionarMensagem("Erro ao obter resposta. Tente novamente.", "bot");
        console.error("Erro na API:", error);
    }

    btn.disabled = false;
}

function toggleIcon() {
    let input = document.getElementById("pergunta");
    let btnText = document.getElementById("btnText");
    let btnIcon = document.getElementById("btnIcon");

    if (input.value.length > 0) {
        btnText.style.display = "none"; // Esconde o texto
        btnIcon.style.display = "inline"; // Mostra o ícone
    } else {
        btnText.style.display = "inline"; // Mostra o texto novamente
        btnIcon.style.display = "none"; // Esconde o ícone
    }
}

function handleKeyPress(event) {
    let input = document.getElementById("pergunta");
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        enviarPergunta();
    }
}

obterCidadeUsuario();


function toggleDropdown(id, arrowClass) {
    var dropdown = document.getElementById(id);
    var arrow = document.querySelector(`.${arrowClass}`);

    // Fecha todos os dropdowns antes de abrir o atual
    document.querySelectorAll(".dropdown-content").forEach(function (el) {
        if (el.id !== id) el.style.display = "none";
    });

    document.querySelectorAll(".arrow").forEach(function (el) {
        if (!el.classList.contains(arrowClass)) el.style.transform = "rotate(-45deg)";
    });

    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
        arrow.style.transform = "rotate(-45deg)"; // Volta ao normal
    } else {
        dropdown.style.display = "block";
        arrow.style.transform = "rotate(135deg)"; // Gira para baixo
    }
}

// Fechar dropdowns ao clicar fora
window.onclick = function (event) {
    if (!event.target.closest(".btn-dropdown")) {
        document.querySelectorAll(".dropdown-content").forEach(function (dropdown) {
            dropdown.style.display = "none";
        });

        document.querySelectorAll(".arrow").forEach(function (arrow) {
            arrow.style.transform = "rotate(-45deg)";
        });
    }
};

        