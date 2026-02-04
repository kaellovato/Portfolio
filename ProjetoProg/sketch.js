// ============================================================
// PLUGIES DREAMY CHAOS — Arquivo Principal do p5.js
// ============================================================
// Este arquivo controla:
// - Setup do canvas e carregamento de imagens
// - Loop principal do jogo (draw)
// - HUD de vidas (GIFs animados via HTML)
// - Plugie dancer (personagem que dança)
// - Cheat codes para debug
// ============================================================

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================

// Variável global para gerenciar todos os minigames
let manager;

// ============================================================
// SISTEMA DE CHEAT CODES
// ============================================================
// Digite "gameover" durante o jogo para ir à tela de Game Over
// (útil para testar a tela de Game Over sem perder todas as vidas)
// ============================================================

let cheatBuffer = ""; // Buffer para armazenar teclas digitadas
const CHEAT_GAMEOVER = "gameover"; // Código para ativar Game Over

// ============================================================
// preload: Carrega imagens antes do jogo começar
// ============================================================
// Esta função é chamada ANTES do setup() pelo p5.js.
// Todas as imagens são carregadas aqui para evitar lag durante o jogo.
// ============================================================
function preload() {
  // --- IMAGENS DO ARROWGAME ---
  window.bgGame = loadImage("IMGS/New_Drawing_1.png"); // Fundo do jogo
  window.arrowLeft = loadImage("IMGS/setinhaesquerda.png"); // Seta esquerda
  window.arrowRight = loadImage("IMGS/setinhadireita.png"); // Seta direita
  window.arrowUp = loadImage("IMGS/setinhacima.png"); // Seta cima
  window.arrowDown = loadImage("IMGS/setinhabaixo.png"); // Seta baixo
  window.hitOverlay = loadImage("IMGS/caixinhaui.png"); // Overlay/hitbox

  // --- IMAGENS DO HUD DE VIDAS ---
  window.vidaViva = loadImage("IMGS/vida1.png"); // Vida cheia (fallback)
  window.vidaMorta = loadImage("IMGS/vidamorta.png"); // Vida perdida

  // --- FRAMES DO GOBLIN (GoblinGame) ---
  window.goblinFrame0 = loadImage("IMGS/frame_final.png");
  window.goblinFrame1 = loadImage("IMGS/frame_final-1.png");
  window.goblinFrame2 = loadImage("IMGS/frame_final-2.png");
  window.goblinFrame3 = loadImage("IMGS/frame_final-3.png");
  window.goblinFrame4 = loadImage("IMGS/frame_final-4.png");
  window.goblinFrame5 = loadImage("IMGS/frame_final-5.png");
  window.goblinFrame6 = loadImage("IMGS/frame_final-6.png");
}

// ============================================================
// setup: Inicializa o jogo
// ============================================================
// Chamado uma vez quando a página carrega.
// Cria o canvas, HUD, e instâncias dos minigames.
// ============================================================
function setup() {
  // Remove canvases antigos (evita duplicação se setup for chamado novamente)
  try {
    const container = document.getElementById("gameContainer");
    if (container) {
      const old = container.querySelectorAll("canvas");
      old.forEach((c) => c.remove());
    }
  } catch (e) {}

  // Cria o canvas fullscreen
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("gameContainer"); // Define container pai

  // Cria elementos HTML do HUD
  createLivesHUD(); // HUD de vidas (GIFs)
  createPlugieHUD(); // Plugie dancer

  // Ativa suavização nos desenhos
  smooth();

  // ============================================================
  // CRIAÇÃO DO GAMEMANAGER E MINIGAMES
  // ============================================================
  manager = new GameManager();

  // Adiciona os minigames na ordem em que serão jogados
  manager.addMinigame(new ArrowGame()); // Minigame 1: Setas rítmicas
  manager.addMinigame(new GoblinGame()); // Minigame 2: Quick-time event do Goblin
  manager.addMinigame(new LabirintGame()); // Minigame 3: Labirinto

  // O jogo começa parado; draw não é chamado até startGame()
  noLoop();
}

// ============================================================
// draw: Loop principal do jogo (60fps)
// ============================================================
function draw() {
  // Atualiza a lógica e desenha o minigame atual
  if (manager) {
    manager.update();
    manager.draw();
  }
}

// ============================================================
// keyPressed: Detecta quando uma tecla é pressionada
// ============================================================
function keyPressed() {
  // Obtém o minigame atual
  const current = manager.minigames[manager.current];

  // Se o minigame tiver o método keyPressed, chama-o
  if (current && typeof current.keyPressed === "function") {
    current.keyPressed();
  }

  // --- SISTEMA DE CHEAT CODE ---
  // Digita "gameover" para ir à tela de Game Over (para testes)
  cheatBuffer += key.toLowerCase();
  // Mantém apenas os últimos caracteres necessários
  if (cheatBuffer.length > CHEAT_GAMEOVER.length) {
    cheatBuffer = cheatBuffer.slice(-CHEAT_GAMEOVER.length);
  }
  // Verifica se digitou "gameover"
  if (cheatBuffer === CHEAT_GAMEOVER) {
    cheatBuffer = ""; // Reseta o buffer
    if (manager) {
      if (typeof hideLivesHUD === "function") hideLivesHUD();
      if (typeof hidePlugieHUD === "function") hidePlugieHUD();
      manager.gameStarted = false;
      manager.gameOver = new GameOver(4, 0, 0, 500); // 500 minigames perfeitos (exemplo)
      console.log("CHEAT: Game Over ativado!");
    }
  }
}

// ============================================================
// startGame: Inicia o jogo quando o usuário clica em Play
// ============================================================
function startGame() {
  // Inicia o loop de draw()
  loop();

  // Inicia o GameManager e o primeiro minigame
  if (manager) {
    // Notifica resize para minigames se adaptarem ao tamanho do canvas
    if (typeof manager.onResize === "function") manager.onResize(width, height);
    const current = manager.minigames[manager.current];
    if (current && typeof current.onResize === "function")
      current.onResize(width, height);
    manager.start();
  }
}

// ============================================================
// windowResized: Adapta o jogo quando a janela muda de tamanho
// ============================================================
function windowResized() {
  // Redimensiona o canvas para a nova largura e altura da janela
  resizeCanvas(windowWidth, windowHeight);

  // Se existir o GameManager, notifica sobre a mudança de tamanho
  if (manager) {
    // Chama onResize do GameManager, se existir
    if (typeof manager.onResize === "function") {
      manager.onResize(width, height);
    }

    // Obtém o minigame atual
    const current = manager.minigames[manager.current];

    // Chama onResize do minigame atual, se existir
    if (current && typeof current.onResize === "function") {
      current.onResize(width, height);
    }
  }
}

// ============================================================
// SISTEMA DE HUD DE VIDAS
// ============================================================
// As vidas são exibidas como elementos HTML (não no canvas).
// Isso permite usar GIFs animados para as vidas.
// São 4 vidas no total, no canto superior direito da tela.
// ============================================================

// ============================================================
// createLivesHUD: Cria container HTML com 4 GIFs de vida
// ============================================================
function createLivesHUD() {
  // Remove container anterior se existir
  const oldContainer = document.getElementById("livesHUD");
  if (oldContainer) oldContainer.remove();

  // Cria container para as vidas
  const container = document.createElement("div");
  container.id = "livesHUD";
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 1000;
    pointer-events: none;
  `;

  // Cria 4 imagens de vida (GIFs animados)
  for (let i = 0; i < 4; i++) {
    const img = document.createElement("img");
    img.src = "GIFS/Vida.gif"; // GIF animado de vida
    img.id = "vida" + i;
    img.style.cssText = `
      width: 80px;
      height: 80px;
      object-fit: contain;
    `;
    container.appendChild(img);
  }

  // Adiciona ao body
  document.body.appendChild(container);

  // Esconde inicialmente (só mostra durante o jogo)
  container.style.display = "none";
}

// ============================================================
// showLivesHUD / hideLivesHUD: Mostra/esconde as vidas
// ============================================================
function showLivesHUD() {
  const container = document.getElementById("livesHUD");
  if (container) container.style.display = "flex";
}

function hideLivesHUD() {
  const container = document.getElementById("livesHUD");
  if (container) container.style.display = "none";
}

// ============================================================
// updateLivesHUD: Atualiza as vidas (viva ou morta)
// ============================================================
// currentLives: número de vidas restantes (0 a 4)
// As vidas são atualizadas da esquerda para direita.
// Vida viva = GIF animado, Vida morta = imagem estática.
// ============================================================
function updateLivesHUD(currentLives) {
  for (let i = 0; i < 4; i++) {
    const img = document.getElementById("vida" + i);
    if (img) {
      if (i < currentLives) {
        // Vida viva - GIF animado
        img.src = "GIFS/Vida.gif";
      } else {
        // Vida morta - imagem estática
        img.src = "IMGS/vidamorta.png";
      }
    }
  }
}

// ============================================================
// SISTEMA DO PLUGIE DANCER
// ============================================================
// O Plugie é um personagem que dança conforme o jogador
// acerta as setas no ArrowGame.
// Ele se move na direção da seta pressionada e volta ao centro.
// ============================================================
// Imagens de dança:
//   - plugie_dancab1.png, plugie_dancab2.png = BAIXO (down)
//   - plugie_dancac1.png, plugie_dancac2.png = CIMA (up)
//   - plugie_dancad1.png, plugie_dancad2.png = DIREITA (right)
//   - plugie_dancae1.png, plugie_dancae2.png = ESQUERDA (left)
//   - plug_anim3.gif = IDLE (parado)
// ============================================================

let plugieAnimTimeout = null; // Timeout para voltar ao idle
let plugieAnimFrame = 1; // Frame atual da animação (1 ou 2)

// ============================================================
// createPlugieHUD: Cria o elemento HTML do Plugie
// ============================================================
function createPlugieHUD() {
  // Remove anterior se existir
  const old = document.getElementById("plugieHUD");
  if (old) old.remove();

  // Cria container centralizado na parte inferior
  const container = document.createElement("div");
  container.id = "plugieHUD";
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    pointer-events: none;
    transition: transform 0.1s ease-out;
  `;

  // Cria imagem do Plugie
  const img = document.createElement("img");
  img.id = "plugieImg";
  img.src = "GIFS/plug_anim3.gif"; // Estado idle (parado, respirando)
  img.style.cssText = `
    width: 650px;
    height: 650px;
    object-fit: contain;
  `;
  container.appendChild(img);

  document.body.appendChild(container);

  // Esconde inicialmente (só aparece no ArrowGame)
  container.style.display = "none";
}

// ============================================================
// showPlugieHUD / hidePlugieHUD: Mostra/esconde o Plugie
// ============================================================
function showPlugieHUD() {
  const container = document.getElementById("plugieHUD");
  if (container) container.style.display = "block";
}

function hidePlugieHUD() {
  const container = document.getElementById("plugieHUD");
  if (container) container.style.display = "none";
}

// ============================================================
// animatePlugie: Anima o Plugie para uma direção
// ============================================================
// direction: "left", "right", "up", "down"
// O Plugie muda para a pose de dança correspondente e
// se move na direção da seta. Após 200ms, volta ao idle.
// ============================================================
function animatePlugie(direction) {
  const container = document.getElementById("plugieHUD");
  const img = document.getElementById("plugieImg");
  if (!img || !container) return;

  // Mapeia direção para letra do arquivo de imagem
  // b = baixo (down), c = cima (up), d = direita (right), e = esquerda (left)
  const dirMap = {
    down: "b",
    up: "c",
    right: "d",
    left: "e",
  };

  const letter = dirMap[direction];
  if (!letter) return;

  // Alterna entre frame 1 e 2 para animação
  plugieAnimFrame = plugieAnimFrame === 1 ? 2 : 1;

  // Muda para a imagem de dança correspondente
  img.src = `IMGS/plugie_danca${letter}${plugieAnimFrame}.png`;

  // Move o Plugie na direção da seta (sai do eixo central)
  const moveAmount = 100; // <-- ALTERE AQUI: Pixels para se mover lateralmente
  const moveDown = 10; // <-- ALTERE AQUI: Pixels para baixo (menor que os outros)
  let offsetX = 0;
  let offsetY = 0;
  if (direction === "left") offsetX = -moveAmount;
  if (direction === "right") offsetX = moveAmount;
  if (direction === "up") offsetY = -moveAmount;
  if (direction === "down") offsetY = moveDown;

  // Aplica o movimento (mantém o translateX(-50%) para centralizar)
  container.style.transform = `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px)`;

  // Cancela timeout anterior se existir
  if (plugieAnimTimeout) {
    clearTimeout(plugieAnimTimeout);
  }

  // Volta ao idle e posição central após 200ms
  plugieAnimTimeout = setTimeout(() => {
    img.src = "GIFS/plug_anim3.gif";
    container.style.transform = "translateX(-50%)";
  }, 200); // <-- ALTERE AQUI: Tempo antes de voltar ao idle (ms)
}

// ============================================================
// resetPlugieToIdle: Reseta o Plugie para estado idle
// ============================================================
function resetPlugieToIdle() {
  const container = document.getElementById("plugieHUD");
  const img = document.getElementById("plugieImg");
  if (img) img.src = "GIFS/plug_anim3.gif";
  if (container) container.style.transform = "translateX(-50%)";
  if (plugieAnimTimeout) {
    clearTimeout(plugieAnimTimeout);
    plugieAnimTimeout = null;
  }
}
