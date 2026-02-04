// ============================================================
// PLUGIES DREAMY CHAOS — Script do Menu
// ============================================================
// Este arquivo controla:
// - Música de fundo do menu (3 músicas alternando)
// - Botão Play para iniciar o jogo
// - Transição suave entre menu e jogo
// ============================================================

// ============================================================
// SISTEMA DE MÚSICA DO MENU
// ============================================================
// O menu tem 3 músicas diferentes que tocam aleatoriamente.
// Quando uma música termina, outra aleatória começa.
// A música tem fade in ao iniciar e fade out ao clicar em Play.
// ============================================================

// Array com as 3 músicas do menu
const menuMusicFiles = [
  "SFX/MenuMusic1.mp3",
  "SFX/MenuMusic2.mp3",
  "SFX/MenuMusic3.mp3",
];

// ============================================================
// getRandomMenuMusic: Retorna uma música aleatória do array
// ============================================================
function getRandomMenuMusic() {
  const randomIndex = Math.floor(Math.random() * menuMusicFiles.length);
  return menuMusicFiles[randomIndex];
}

// Cria o objeto de áudio com música aleatória inicial
let menuMusic = new Audio(getRandomMenuMusic());
menuMusic.volume = 0.4; // <-- ALTERE AQUI: Volume da música do menu (0.0 a 1.0)

// ============================================================
// Evento: Quando a música termina, toca outra aleatória
// ============================================================
menuMusic.addEventListener("ended", () => {
  menuMusic.src = getRandomMenuMusic();
  menuMusic.play().catch(() => {});
});

// ============================================================
// startMenuMusic: Inicia a música com fade in
// ============================================================
function startMenuMusic() {
  menuMusic.src = getRandomMenuMusic(); // Escolhe música aleatória ao iniciar
  menuMusic.volume = 0;
  menuMusic.play().catch(() => {
    // Se o navegador bloquear autoplay, tenta novamente no primeiro clique
    document.addEventListener(
      "click",
      () => {
        if (menuMusic.paused) {
          menuMusic.play();
          fadeInMusic();
        }
      },
      { once: true }
    );
  });
  fadeInMusic();
}

// ============================================================
// fadeInMusic: Fade in suave da música
// ============================================================
function fadeInMusic() {
  let vol = 0;
  const fadeInterval = setInterval(() => {
    vol += 0.02; // <-- ALTERE AQUI: Velocidade do fade in
    if (vol >= 0.4) {
      vol = 0.4;
      clearInterval(fadeInterval);
    }
    menuMusic.volume = vol;
  }, 50); // <-- ALTERE AQUI: Intervalo do fade (ms)
}

// ============================================================
// fadeOutMenuMusic: Fade out suave da música
// ============================================================
function fadeOutMenuMusic() {
  let vol = menuMusic.volume;
  const fadeInterval = setInterval(() => {
    vol -= 0.02; // <-- ALTERE AQUI: Velocidade do fade out
    if (vol <= 0) {
      vol = 0;
      menuMusic.pause();
      clearInterval(fadeInterval);
    }
    menuMusic.volume = vol;
  }, 30); // <-- ALTERE AQUI: Intervalo do fade (ms)
}

// ============================================================
// Evento: Inicia a música quando a página carrega
// ============================================================
// A música agora é iniciada pelo userSystem.js após o login
// window.addEventListener("load", startMenuMusic);

// ============================================================
// BOTÕES DO MENU
// ============================================================

// ============================================================
// Botão PLAY: Inicia o jogo
// ============================================================
// 1. Faz fade out da música do menu
// 2. Esconde o menu principal
// 3. Mostra o container do jogo (canvas p5.js)
// 4. Chama startGame() do sketch.js
// ============================================================
document.getElementById("playButton").addEventListener("click", () => {
  // Fade out da música do menu
  fadeOutMenuMusic();

  // Esconde o menu principal
  document.getElementById("menu").style.display = "none";

  // Mostra o container do jogo
  document.getElementById("gameContainer").style.display = "block";

  // Inicia o jogo chamando a função startGame() do sketch.js
  startGame();
});

// ============================================================
// SISTEMA DE CONFIGURAÇÕES DE SOM
// ============================================================
// Controla o volume geral, música e efeitos sonoros do jogo.
// Os valores são salvos no localStorage para persistir entre sessões.
// ============================================================

// Variáveis globais de volume (acessíveis por outros scripts)
let masterVolume = 0.5; // Volume geral (0.0 a 1.0)
let musicVolume = 0.4; // Volume da música (0.0 a 1.0)
let sfxVolume = 0.7; // Volume dos efeitos sonoros (0.0 a 1.0)

// ============================================================
// Função para obter a chave de volume do utilizador atual
// ============================================================
function getVolumeKey(volumeType) {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (user && user.name) {
    return `${volumeType}_${user.name}`;
  }
  return volumeType; // Fallback para chave global
}

// Carrega volumes salvos do localStorage (se existirem)
function loadSavedVolumes() {
  const savedMaster = localStorage.getItem(getVolumeKey("masterVolume"));
  const savedMusic = localStorage.getItem(getVolumeKey("musicVolume"));
  const savedSfx = localStorage.getItem(getVolumeKey("sfxVolume"));

  if (savedMaster !== null) masterVolume = parseFloat(savedMaster);
  if (savedMusic !== null) musicVolume = parseFloat(savedMusic);
  if (savedSfx !== null) sfxVolume = parseFloat(savedSfx);

  // Atualiza os sliders com os valores salvos
  document.getElementById("masterVolume").value = masterVolume * 100;
  document.getElementById("musicVolume").value = musicVolume * 100;
  document.getElementById("sfxVolume").value = sfxVolume * 100;

  // Atualiza os textos de porcentagem
  document.getElementById("masterVolumeValue").textContent =
    Math.round(masterVolume * 100) + "%";
  document.getElementById("musicVolumeValue").textContent =
    Math.round(musicVolume * 100) + "%";
  document.getElementById("sfxVolumeValue").textContent =
    Math.round(sfxVolume * 100) + "%";

  // Aplica o volume na música do menu
  applyMusicVolume();
}

// Aplica o volume na música (considera master * music)
function applyMusicVolume() {
  menuMusic.volume = masterVolume * musicVolume;
}

// Função para obter o volume de SFX (usada por outros scripts)
function getSfxVolume() {
  return masterVolume * sfxVolume;
}

// Abre o modal de configurações
document.getElementById("settingsButton").addEventListener("click", () => {
  document.getElementById("settingsModal").classList.remove("modal-hidden");
});

// Fecha o modal de configurações
document.getElementById("closeSettings").addEventListener("click", () => {
  document.getElementById("settingsModal").classList.add("modal-hidden");
});

// Fecha o modal ao clicar fora dele
document.getElementById("settingsModal").addEventListener("click", (e) => {
  if (e.target.id === "settingsModal") {
    document.getElementById("settingsModal").classList.add("modal-hidden");
  }
});

// Slider de Volume Geral
document.getElementById("masterVolume").addEventListener("input", (e) => {
  masterVolume = e.target.value / 100;
  document.getElementById("masterVolumeValue").textContent =
    e.target.value + "%";
  localStorage.setItem(getVolumeKey("masterVolume"), masterVolume);
  applyMusicVolume();
});

// Slider de Volume da Música
document.getElementById("musicVolume").addEventListener("input", (e) => {
  musicVolume = e.target.value / 100;
  document.getElementById("musicVolumeValue").textContent =
    e.target.value + "%";
  localStorage.setItem(getVolumeKey("musicVolume"), musicVolume);
  applyMusicVolume();
});

// Slider de Volume de Efeitos Sonoros
document.getElementById("sfxVolume").addEventListener("input", (e) => {
  sfxVolume = e.target.value / 100;
  document.getElementById("sfxVolumeValue").textContent = e.target.value + "%";
  localStorage.setItem(getVolumeKey("sfxVolume"), sfxVolume);
});

// Carrega os volumes salvos quando a página carrega
window.addEventListener("load", loadSavedVolumes);

// ============================================================
// MODAL DE CRÉDITOS
// ============================================================

// Abre o modal de créditos
document.getElementById("creditsButton").addEventListener("click", () => {
  document.getElementById("creditsModal").classList.remove("modal-hidden");
});

// Fecha o modal de créditos
document.getElementById("closeCredits").addEventListener("click", () => {
  document.getElementById("creditsModal").classList.add("modal-hidden");
});

// ============================================================
// MODAL DE SCOREBOARD
// ============================================================

// Renderiza o scoreboard com ranking
function renderScoreboard() {
  const scoreboardList = document.getElementById("scoreboardList");
  if (!scoreboardList) return;

  // Obtém utilizadores ordenados por highscore
  const ranking =
    typeof getHighscoreRanking === "function" ? getHighscoreRanking() : [];
  const currentUser =
    typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (ranking.length === 0) {
    scoreboardList.innerHTML =
      '<p class="no-scores-message">Nenhum score registado ainda!</p>';
    return;
  }

  scoreboardList.innerHTML = "";

  ranking.forEach((user, index) => {
    const entry = document.createElement("div");
    entry.className = "score-entry";

    // Destaca o utilizador atual
    if (currentUser && user.name === currentUser.name) {
      entry.classList.add("current-user");
    }

    // Medalhas para top 3
    let rankDisplay = (index + 1).toString();
    if (index === 0) rankDisplay = "🥇";
    else if (index === 1) rankDisplay = "🥈";
    else if (index === 2) rankDisplay = "🥉";

    entry.innerHTML = `
      <span class="score-rank">${rankDisplay}</span>
      <span class="score-name">${escapeHTMLForScores(user.name)}</span>
      <span class="score-value">★ ${user.highscore}</span>
    `;

    scoreboardList.appendChild(entry);
  });
}

// Função auxiliar para escapar HTML (caso não exista)
function escapeHTMLForScores(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Abre o modal de scores
document.getElementById("scoresButton").addEventListener("click", () => {
  renderScoreboard();
  document.getElementById("scoresModal").classList.remove("modal-hidden");
});

// Fecha o modal de scores
document.getElementById("closeScores").addEventListener("click", () => {
  document.getElementById("scoresModal").classList.add("modal-hidden");
});

// Fecha o modal ao clicar fora
document.getElementById("scoresModal").addEventListener("click", (e) => {
  if (e.target.id === "scoresModal") {
    document.getElementById("scoresModal").classList.add("modal-hidden");
  }
});

// Fecha o modal ao pressionar ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("creditsModal").classList.add("modal-hidden");
    document.getElementById("settingsModal").classList.add("modal-hidden");
    document.getElementById("scoresModal").classList.add("modal-hidden");
  }
});
