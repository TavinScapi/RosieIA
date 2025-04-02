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

    // Se for uma mensagem do bot, exibe o texto sem o "Rosie:"
    if (classe === "bot") {
        // Cria a mensagem sem o "Rosie:"
        texto = texto.replace(/^Rosie:\s*/, "");

        // Cria um contêiner para a mensagem e a imagem (caso queira posicionar a imagem antes do texto)
        let mensagemConteiner = document.createElement("div");
        mensagemConteiner.classList.add("message-content");

        // Cria a imagem do bot
        let imagemBot = document.createElement("img");
        imagemBot.src = imageUrl; // Usando a variável com o caminho correto
        imagemBot.alt = "Rosie";
        imagemBot.classList.add("bot-image");

        // Adiciona o texto da mensagem
        let textoMensagem = document.createElement("p");
        textoMensagem.innerText = texto;

        // Adiciona a imagem e o texto ao contêiner
        mensagemConteiner.appendChild(imagemBot);
        mensagemConteiner.appendChild(textoMensagem);

        // Cria o botão de copiar
        let botaoCopiar = document.createElement("button");
        botaoCopiar.classList.add("btn-copiar");

        // Adiciona o ícone de copiar ao botão
        let iconeCopiar = document.createElement("i");
        iconeCopiar.classList.add("fas", "fa-copy");
        botaoCopiar.appendChild(iconeCopiar);

        // Adiciona o evento para copiar o texto da mensagem
        botaoCopiar.onclick = function () {
            copiarMensagem(texto, iconeCopiar);
        };

        // Adiciona o contêiner da mensagem e o botão de copiar
        mensagem.appendChild(mensagemConteiner);
        mensagem.appendChild(botaoCopiar);
    } else {
        // Caso seja outra classe, apenas a mensagem é adicionada normalmente
        mensagem.innerText = texto;
    }

    chat.appendChild(mensagem);
    chat.scrollTop = chat.scrollHeight;
}


function copiarMensagem(texto, iconeCopiar) {
    let tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = texto;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Troca o ícone de copiar para check
    iconeCopiar.classList.remove("fa-copy");
    iconeCopiar.classList.add("fa-check");

    // Após 2 segundos, volta o ícone para "copiar"
    setTimeout(function () {
        iconeCopiar.classList.remove("fa-check");
        iconeCopiar.classList.add("fa-copy");
    }, 2000);

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
        let canvas = document.querySelector("canvas");

        // Fixando o input-container na parte inferior da tela
        inputContainer.style.position = "fixed";
        inputContainer.style.bottom = "15px";  // Distância do rodapé
        inputContainer.style.width = "100%";
        inputContainer.style.zIndex = "1000";

        inputContainer.style.transform = "scale(0.8)";
        inputContainer.style.transition = "transform 0.5s ease";

        // Ajustando o chat-container para não ser sobreposto
        chatContainer.style.marginBottom = "140px";  // Espaço extra para o input fixado

        // Diminuindo o tamanho do footer após a primeira pergunta
        footer.style.height = "8px";  // Ajusta a altura
        footer.style.fontSize = "12px";  // Diminui o tamanho da fonte
        footer.style.transition = "all 0.5s ease";  // Transição suave para todas as propriedades

        // Ajustando o canvas para 100% de largura e altura e removendo margin-left
        canvas.style.width = "100%";  // Definindo a largura para 100%
        canvas.style.height = "100%";  // Definindo a altura para 100%
        canvas.style.marginLeft = "0";  // Removendo qualquer margin-left

        // Adicionando a transição para suavizar as mudanças de estilo no canvas
        canvas.style.transition = "transform 0.5s ease, width 0.5s ease, height 0.5s ease, margin-left 0.5s ease";

        // Usando transform para ajustar a posição, se necessário
        canvas.style.transform = "translateY(-150px)";  // Caso precise reposicionar o canvas


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

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function resetPage() {
    location.reload();
}

function toggleConfig() {
    const configContainer = document.getElementById('configContainer');
    configContainer.classList.toggle('active');
}

function changeLanguage() {
    const lang = document.getElementById('idioma').value;
    if (lang === 'en') {
        document.getElementById('novoChat').textContent = 'New Chat';
        document.getElementById('sobre').textContent = 'About';
        document.getElementById('config').textContent = 'Settings';
        document.getElementById('contato').textContent = 'Contact';
        document.getElementById('tituloConfig').textContent = 'Settings';
        document.getElementById('labelIdioma').textContent = 'Language:';
    } else if (lang === 'pt') {
        document.getElementById('novoChat').textContent = 'Novo Chat';
        document.getElementById('sobre').textContent = 'Sobre';
        document.getElementById('config').textContent = 'Configurações';
        document.getElementById('contato').textContent = 'Contato';
        document.getElementById('tituloConfig').textContent = 'Configurações';
        document.getElementById('labelIdioma').textContent = 'Idioma:';
    }
}




let canvas, ctx;
let render, init;
let blob;

class Blob {
    constructor() {
        this.points = [];
    }

    init() {
        for (let i = 0; i < this.numPoints; i++) {
            let point = new Point(this.divisional * (i + 1), this);
            // point.acceleration = -1 + Math.random() * 2;
            this.push(point);
        }
    }

    render() {
        let canvas = this.canvas;
        let ctx = this.ctx;
        let position = this.position;
        let pointsArray = this.points;
        let radius = this.radius;
        let points = this.numPoints;
        let divisional = this.divisional;
        let center = this.center;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pointsArray[0].solveWith(pointsArray[points - 1], pointsArray[1]);

        let p0 = pointsArray[points - 1].position;
        let p1 = pointsArray[0].position;
        let _p2 = p1;

        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);

        for (let i = 1; i < points; i++) {

            pointsArray[i].solveWith(pointsArray[i - 1], pointsArray[i + 1] || pointsArray[0]);

            let p2 = pointsArray[i].position;
            var xc = (p1.x + p2.x) / 2;
            var yc = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
            // ctx.lineTo(p2.x, p2.y);

            ctx.fillStyle = '#000000';
            // ctx.fillRect(p1.x-2.5, p1.y-2.5, 5, 5);

            p1 = p2;
        }

        var xc = (p1.x + _p2.x) / 2;
        var yc = (p1.y + _p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);

        // Criando um gradiente radial
        let gradient = ctx.createRadialGradient(
            center.x, center.y, radius / 2,
            center.x, center.y, radius
        );
        gradient.addColorStop(0, '#ffffff2a'); // Vermelho no centro
        gradient.addColorStop(1, '#ffffff5a'); // Azul na borda

        ctx.fillStyle = gradient; // Aplica o gradiente
        ctx.fill();

        ctx.strokeStyle = '#000000';
        requestAnimationFrame(this.render.bind(this));
    }

    push(item) {
        if (item instanceof Point) {
            this.points.push(item);
        }
    }

    set color(value) {
        this._color = value;
    }
    get color() {
        return this._color || '#000000';
    }

    set canvas(value) {
        if (value instanceof HTMLElement && value.tagName.toLowerCase() === 'canvas') {
            this._canvas = canvas;
            this.ctx = this._canvas.getContext('2d');
        }
    }
    get canvas() {
        return this._canvas;
    }

    set numPoints(value) {
        if (value > 2) {
            this._points = value;
        }
    }
    get numPoints() {
        return this._points || 32;
    }

    set radius(value) {
        if (value > 0) {
            this._radius = value;
        }
    }
    get radius() {
        return this._radius || 150;
    }

    set position(value) {
        if (typeof value == 'object' && value.x && value.y) {
            this._position = value;
        }
    }
    get position() {
        return this._position || { x: 0.5, y: 0.5 };
    }

    get divisional() {
        return Math.PI * 2 / this.numPoints;
    }

    get center() {
        return { x: this.canvas.width * this.position.x, y: this.canvas.height * this.position.y };
    }

    set running(value) {
        this._running = value === true;
    }
    get running() {
        return this.running !== false;
    }
}

class Point {
    constructor(azimuth, parent) {
        this.parent = parent;
        this.azimuth = Math.PI - azimuth;
        this._components = {
            x: Math.cos(this.azimuth),
            y: Math.sin(this.azimuth)
        };

        this.acceleration = -0.3 + Math.random() * 0.6;
    }

    solveWith(leftPoint, rightPoint) {
        this.acceleration = (-0.3 * this.radialEffect + (leftPoint.radialEffect - this.radialEffect) + (rightPoint.radialEffect - this.radialEffect)) * this.elasticity - this.speed * this.friction;
    }

    set acceleration(value) {
        if (typeof value == 'number') {
            this._acceleration = value;
            this.speed += this._acceleration * 2;
        }
    }
    get acceleration() {
        return this._acceleration || 0;
    }

    set speed(value) {
        if (typeof value == 'number') {
            this._speed = value;
            this.radialEffect += this._speed * 5;
        }
    }
    get speed() {
        return this._speed || 0;
    }

    set radialEffect(value) {
        if (typeof value == 'number') {
            this._radialEffect = value;
        }
    }
    get radialEffect() {
        return this._radialEffect || 0;
    }

    get position() {
        return {
            x: this.parent.center.x + this.components.x * (this.parent.radius + this.radialEffect),
            y: this.parent.center.y + this.components.y * (this.parent.radius + this.radialEffect)
        }
    }

    get components() {
        return this._components;
    }

    set elasticity(value) {
        if (typeof value === 'number') {
            this._elasticity = value;
        }
    }
    get elasticity() {
        return this._elasticity || 0.001;
    }
    set friction(value) {
        if (typeof value === 'number') {
            this._friction = value;
        }
    }
    get friction() {
        return this._friction || 0.0085;
    }
}

blob = new Blob;

init = function () {
    canvas = document.createElement('canvas');
    canvas.setAttribute('touch-action', 'none');

    document.body.appendChild(canvas);

    let resize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let oldMousePoint = { x: 0, y: 0 };
    let hover = false;
    let mouseMove = function (e) {

        let pos = blob.center;
        let diff = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        let dist = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y));
        let angle = null;

        blob.mousePos = { x: pos.x - e.clientX, y: pos.y - e.clientY };

        if (dist < blob.radius && hover === false) {
            let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = true;
            // blob.color = '#77FF00';
        } else if (dist > blob.radius && hover === true) {
            let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = false;
            blob.color = null;
        }

        if (typeof angle == 'number') {

            let nearestPoint = null;
            let distanceFromPoint = 100;

            blob.points.forEach((point) => {
                if (Math.abs(angle - point.azimuth) < distanceFromPoint) {
                    // console.log(point.azimuth, angle, distanceFromPoint);
                    nearestPoint = point;
                    distanceFromPoint = Math.abs(angle - point.azimuth);
                }

            });

            if (nearestPoint) {
                let strength = { x: oldMousePoint.x - e.clientX, y: oldMousePoint.y - e.clientY };
                strength = Math.sqrt((strength.x * strength.x) + (strength.y * strength.y)) * 10;
                if (strength > 100) strength = 100;
                nearestPoint.acceleration = strength / 100 * (hover ? -1 : 1);
            }
        }

        oldMousePoint.x = e.clientX;
        oldMousePoint.y = e.clientY;
    }
    // window.addEventListener('mousemove', mouseMove);
    window.addEventListener('pointermove', mouseMove);

    blob.canvas = canvas;
    blob.init();
    blob.render();
}

init();