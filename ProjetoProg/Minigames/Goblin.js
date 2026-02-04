// ============================================================
// GoblinGame — Minigame do Goblin Correndo
// ============================================================
// O jogador vê um fundo com olhos (Gif_Olhos.gif).
// Após 2-7 segundos, um goblin começa a correr em direção ao jogador.
// O jogador deve pressionar 3 teclas aleatórias antes do goblin chegar.
// ============================================================

function GoblinGame() {
  // --- FLAGS DE ESTADO ---
  this.finished = false; // true quando o minigame termina
  this.mistakes = 0; // contador de erros
  this.maxMistakes = 3; // 3 erros de tecla = perde
  this.wrongKeyCount = 0; // contador de teclas erradas

  // --- TAMANHO DO CANVAS ---
  this._w = windowWidth;
  this._h = windowHeight;

  // ============================================================
  // CONFIGURAÇÕES DE FÁCIL ALTERAÇÃO
  // ============================================================

  // Tempo de espera antes do goblin aparecer (em ms)
  this.MIN_WAIT_TIME = 2000; // mínimo 2 segundos
  this.MAX_WAIT_TIME = 5000; // máximo 5 segundos

  // Velocidade base do goblin (pixels por frame)
  // Será multiplicada pelo speedMultiplier
  this.BASE_GOBLIN_SPEED = 0.22;

  // Tamanho do goblin (será escalado conforme se aproxima)
  this.GOBLIN_MIN_SCALE = 0.3; // escala inicial (longe)
  this.GOBLIN_MAX_SCALE = 3.0; // escala final (perto)

  // Número de teclas que o jogador precisa pressionar
  this.KEYS_REQUIRED = 3;
  // ============================================================
  // VARIÁVEIS INTERNAS
  // ============================================================
  this.state = "waiting"; // "waiting", "running", "success", "fail"
  this.waitStartTime = 0; // quando começou a esperar
  this.waitDuration = 0; // quanto tempo vai esperar
  this.goblinProgress = 0; // 0 = longe, 1 = chegou (perdeu)
  this.currentSpeed = this.BASE_GOBLIN_SPEED;

  // Frames do goblin (carregados no preload)
  this.frames = [];
  this.currentFrame = 0;
  this.frameTimer = 0;
  this.FRAME_DELAY = 100; // ms entre frames da animação

  // Teclas que o jogador precisa pressionar
  this.requiredKeys = [];
  this.pressedKeys = [];

  // Elemento HTML para o fundo GIF
  this.bgElement = null;

  // Animação de final (bom ou ruim)
  this.endingFrame = 0;
  this.endingTimer = 0;
  this.ENDING_FRAME_DELAY = 200; // ms entre frames do final
  this.ENDING_DURATION = 3000; // duração total da animação de final

  this.goodEndingSequence = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
  this.badEndingSequence = [1, 1, 2, 2, 3, 3];

  // Sistema de pontuação
  this.score = 0;
  this.runStartTime = 0; // quando o goblin começou a correr

  // Sons
  this.soundWaiting = new Audio("SFX/Goblin_Waiting.mp3");
  this.soundFootstep = new Audio("SFX/Goblin_Footstep.mp3");
  this.soundGrowl = new Audio("SFX/Goblin_Growl.mp3");
  this.soundPunch = new Audio("SFX/Goblin_Punch.mp3");
  this.soundWaiting.loop = true;
  // footstep não tem loop - toca a cada frame

  // Flag para esperar áudio terminar
  this.waitingForAudio = false;
  this.endingSoundPlaying = null; // referência ao som que está tocando
}

// ============================================================
// onResize: chamado quando a janela é redimensionada
// ============================================================
GoblinGame.prototype.onResize = function (w, h) {
  this._w = w;
  this._h = h;
};

// ============================================================
// generateRandomKeys: gera 3 teclas aleatórias para o jogador pressionar
// ============================================================
GoblinGame.prototype.generateRandomKeys = function () {
  // Lista de teclas possíveis (letras e números)
  var possibleKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

  this.requiredKeys = [];
  this.pressedKeys = [];

  // Escolhe 3 teclas aleatórias (sem repetição)
  while (this.requiredKeys.length < this.KEYS_REQUIRED) {
    var randomIndex = Math.floor(Math.random() * possibleKeys.length);
    var key = possibleKeys[randomIndex];

    // Evita repetição
    if (this.requiredKeys.indexOf(key) === -1) {
      this.requiredKeys.push(key);
    }
  }

  console.log("GoblinGame: Teclas necessárias:", this.requiredKeys.join(", "));
};

// ============================================================
// createBackground: cria elemento HTML para o fundo
// ============================================================
GoblinGame.prototype.createBackground = function () {
  // Remove anterior se existir
  var old = document.getElementById("goblinBg");
  if (old) old.remove();

  // Cria elemento img para o fundo (começa com GIF dos olhos)
  var img = document.createElement("img");
  img.id = "goblinBg";
  img.src = "GIFS/Gif_Olhos.gif"; // Fundo inicial (esperando)
  img.style.cssText =
    "position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; pointer-events: none;";

  document.body.appendChild(img);
  this.bgElement = img;
};

// ============================================================
// removeBackground: remove o elemento HTML do fundo
// ============================================================
GoblinGame.prototype.removeBackground = function () {
  var bg = document.getElementById("goblinBg");
  if (bg) bg.remove();
  this.bgElement = null;
};

// ============================================================
// start: reinicia o estado do minigame
// ============================================================
GoblinGame.prototype.start = function (speedMultiplier) {
  speedMultiplier = speedMultiplier || 1;

  // Reseta flags
  this.finished = false;
  this.mistakes = 0;
  this.wrongKeyCount = 0;
  this.state = "waiting";
  this.goblinProgress = 0;
  this.currentFrame = 0;
  this.frameTimer = millis();
  this.endingFrame = 0;
  this.endingTimer = 0;
  this.score = 0; // reseta pontuação
  this.runStartTime = 0; // reseta tempo de início
  this.waitingForAudio = false; // reseta flag de áudio
  this.endingSoundPlaying = null; // reseta referência de som

  // Aplica multiplicador de velocidade
  this.currentSpeed = this.BASE_GOBLIN_SPEED * speedMultiplier;

  // Gera tempo de espera aleatório
  this.waitDuration =
    this.MIN_WAIT_TIME +
    Math.random() * (this.MAX_WAIT_TIME - this.MIN_WAIT_TIME);
  this.waitStartTime = millis();

  // Carrega os frames do goblin (se ainda não carregados)
  if (this.frames.length === 0) {
    // Os frames são: frame_final.png, frame_final-1.png até frame_final-6.png
    this.frames = [
      window.goblinFrame0,
      window.goblinFrame1,
      window.goblinFrame2,
      window.goblinFrame3,
      window.goblinFrame4,
      window.goblinFrame5,
      window.goblinFrame6,
    ];
  }

  // Cria o fundo GIF
  this.createBackground();

  // Gera as teclas aleatórias
  this.generateRandomKeys();

  // Inicia som de suspense
  this.soundWaiting.currentTime = 0;
  this.soundWaiting.volume = 0.5;
  this.soundWaiting.play().catch((e) => {});

  console.log("GoblinGame started with speedMultiplier:", speedMultiplier);
  console.log("  Tempo de espera:", Math.round(this.waitDuration) + "ms");
  console.log("  Velocidade do goblin:", this.currentSpeed);
};

// ============================================================
// update: lógica do minigame
// ============================================================
GoblinGame.prototype.update = function () {
  if (this.finished) return;

  var now = millis();

  // --- ESTADO: ESPERANDO ---
  if (this.state === "waiting") {
    // Verifica se o tempo de espera acabou
    if (now - this.waitStartTime >= this.waitDuration) {
      this.state = "running";
      // Começa no frame mais distante (frame 6) e vai até o frame 0 (final)
      this.currentFrame = 6;
      this.frameTimer = now;
      this.runStartTime = now; // marca quando o goblin começou a correr
      // Muda o fundo para o primeiro frame do goblin (mais distante)
      if (this.bgElement) {
        this.bgElement.src = "IMGS/frame_final-6.png";
      }
      // Para som de espera - footstep vai tocar a cada frame
      this.soundWaiting.pause();
      // Toca primeiro footstep
      this.soundFootstep.currentTime = 0;
      this.soundFootstep.volume = 0.6;
      this.soundFootstep.play().catch((e) => {});
      console.log("GoblinGame: Goblin começou a correr!");
    }
  }

  // --- ESTADO: GOBLIN CORRENDO ---
  if (this.state === "running") {
    // Calcula o intervalo entre frames baseado na velocidade
    // currentSpeed maior = intervalo menor = mais rápido
    var frameInterval = this.FRAME_DELAY / this.currentSpeed;

    // Atualiza frame da animação (conta regressiva: 6 -> 5 -> 4 -> ... -> 0)
    if (now - this.frameTimer >= frameInterval) {
      this.frameTimer = now;
      this.currentFrame--;

      // Toca footstep a cada mudança de frame
      this.soundFootstep.currentTime = 0;
      this.soundFootstep.play().catch((e) => {});

      // Atualiza a imagem de fundo com o frame atual
      if (this.bgElement && this.currentFrame >= 0) {
        // frame_final-6.png, frame_final-5.png, ..., frame_final-1.png, frame_final.png
        if (this.currentFrame === 0) {
          this.bgElement.src = "IMGS/frame_final.png";
        } else {
          this.bgElement.src = "IMGS/frame_final-" + this.currentFrame + ".png";
        }
      }

      // Verifica se chegou no frame final (frame 0 = goblin pegou o jogador)
      if (this.currentFrame <= 0) {
        this.state = "fail_anim";
        this.mistakes = this.maxMistakes; // marca como perdido
        this.endingFrame = 1;
        this.endingTimer = now;
        // Para sons de corrida
        this.soundWaiting.pause();
        this.soundFootstep.pause();
        // Toca growl (falha)
        this.soundGrowl.currentTime = 0;
        this.soundGrowl.volume = 1.0;
        this.soundGrowl.play().catch((e) => {});
        this.endingSoundPlaying = this.soundGrowl; // guarda referência
        // Mostra primeiro frame do final ruim
        if (this.bgElement) {
          this.bgElement.src = "IMGS/finalmau1.png";
        }
        console.log("GoblinGame: FALHOU! Goblin chegou!");
      }
    }
  }

  // --- ESTADO: ANIMAÇÃO DE SUCESSO ---
  if (this.state === "success_anim") {
    // Anima os frames do final bom usando sequência duplicada
    if (now - this.endingTimer >= this.ENDING_FRAME_DELAY) {
      this.endingTimer = now;
      this.endingFrame++;
      if (this.endingFrame < this.goodEndingSequence.length && this.bgElement) {
        var frameNum = this.goodEndingSequence[this.endingFrame];
        this.bgElement.src = "IMGS/final_bom" + frameNum + ".png";
      }
    }
    // Termina após passar por todos os frames da sequência E áudio terminar
    var animationDone = this.endingFrame >= this.goodEndingSequence.length;
    var audioDone = this.endingSoundPlaying
      ? this.endingSoundPlaying.ended
      : true;
    if (animationDone && audioDone) {
      this.state = "success";
      this.finished = true;
      this.removeBackground();
    }
  }

  // --- ESTADO: ANIMAÇÃO DE FALHA ---
  if (this.state === "fail_anim") {
    // Anima os frames do final ruim usando sequência duplicada
    if (now - this.endingTimer >= this.ENDING_FRAME_DELAY) {
      this.endingTimer = now;
      this.endingFrame++;
      if (this.endingFrame < this.badEndingSequence.length && this.bgElement) {
        var frameNum = this.badEndingSequence[this.endingFrame];
        this.bgElement.src = "IMGS/finalmau" + frameNum + ".png";
      }
    }
    // Termina após passar por todos os frames da sequência E áudio terminar
    var animationDone = this.endingFrame >= this.badEndingSequence.length;
    var audioDone = this.endingSoundPlaying
      ? this.endingSoundPlaying.ended
      : true;
    if (animationDone && audioDone) {
      this.state = "fail";
      this.finished = true;
      this.removeBackground();
    }
  }

  // --- ESTADO: SUCESSO ---
  if (this.state === "success") {
    // Já terminou com sucesso
  }
};

// ============================================================
// draw: desenha o minigame
// ============================================================
GoblinGame.prototype.draw = function () {
  // O fundo é um elemento HTML (imagem), então só precisamos limpar o canvas
  clear(); // Limpa o canvas (transparente)

  // --- ESTADO: ESPERANDO ---
  if (this.state === "waiting") {
    // Mostra texto de preparação
    push();
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("Prepare-se...", this._w / 2, this._h / 2);
    pop();
  }

  // --- ESTADO: GOBLIN CORRENDO ---
  if (this.state === "running") {
    // O goblin É o fundo (troca de imagem no update)
    // Só precisamos mostrar as teclas que precisam ser pressionadas
    this.drawKeyPrompt();

    // Mostra contador de erros
    push();
    fill(255, 100, 100);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(
      "Erros: " + this.wrongKeyCount + "/" + this.maxMistakes,
      this._w / 2,
      50
    );
    pop();
  }

  // --- ESTADO: ANIMAÇÃO DE SUCESSO ---
  if (this.state === "success_anim") {
    // Só mostra o fundo (animação do final bom)
  }

  // --- ESTADO: ANIMAÇÃO DE FALHA ---
  if (this.state === "fail_anim") {
    // Só mostra o fundo (animação do final ruim)
  }

  // --- ESTADO: SUCESSO ---
  if (this.state === "success") {
    push();
    fill(0, 255, 0);
    textSize(60);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("ESCAPOU!", this._w / 2, this._h / 2);
    pop();
  }

  // --- ESTADO: FALHA ---
  if (this.state === "fail") {
    push();
    fill(255, 0, 0);
    textSize(60);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text("PEGO!", this._w / 2, this._h / 2);
    pop();
  }
};

// ============================================================
// drawKeyPrompt: desenha as teclas que precisam ser pressionadas
// ============================================================
GoblinGame.prototype.drawKeyPrompt = function () {
  var boxSize = 80;
  var gap = 20;
  var totalWidth =
    this.requiredKeys.length * boxSize + (this.requiredKeys.length - 1) * gap;
  var startX = this._w / 2 - totalWidth / 2;
  var y = this._h - 150;

  for (var i = 0; i < this.requiredKeys.length; i++) {
    var x = startX + i * (boxSize + gap) + boxSize / 2;
    var key = this.requiredKeys[i];
    var isPressed = this.pressedKeys.indexOf(key) !== -1;

    push();
    rectMode(CENTER);

    // Caixa da tecla
    if (isPressed) {
      fill(0, 200, 0); // Verde se pressionada
      stroke(0, 255, 0);
    } else {
      fill(50, 50, 50, 200); // Cinza escuro se não pressionada
      stroke(255);
    }
    strokeWeight(3);
    rect(x, y, boxSize, boxSize, 10);

    // Letra da tecla
    fill(255);
    noStroke();
    textSize(40);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(key, x, y);

    pop();
  }

  // Texto de instrução
  push();
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Pressione as teclas!", this._w / 2, y - 70);
  pop();
};

// ============================================================
// keyPressed: detecta teclas pressionadas
// ============================================================
GoblinGame.prototype.keyPressed = function () {
  if (this.finished) return;

  // Bloqueia input se está em animação de vitória/derrota ou aguardando áudio
  if (
    this.state === "success_anim" ||
    this.state === "fail_anim" ||
    this.state === "fail" ||
    this.state === "success" ||
    this.waitingForAudio
  )
    return;

  // Só aceita teclas quando o goblin está correndo
  if (this.state !== "running") return;

  // Converte a tecla para maiúscula
  var pressedKey = key.toUpperCase();

  // Verifica se a tecla é uma das necessárias
  var keyIndex = this.requiredKeys.indexOf(pressedKey);

  if (keyIndex !== -1) {
    // Tecla correta!
    // Verifica se já não foi pressionada
    if (this.pressedKeys.indexOf(pressedKey) === -1) {
      this.pressedKeys.push(pressedKey);
      console.log(
        "GoblinGame: Tecla correta!",
        pressedKey,
        "(" + this.pressedKeys.length + "/" + this.KEYS_REQUIRED + ")"
      );

      // Anima o Plugie (direção aleatória para feedback visual)
      if (typeof animatePlugie === "function") {
        var directions = ["left", "right", "up", "down"];
        var randomDir =
          directions[Math.floor(Math.random() * directions.length)];
        animatePlugie(randomDir);
      }

      // Verifica se pressionou todas as teclas
      if (this.pressedKeys.length >= this.KEYS_REQUIRED) {
        this.state = "success_anim";
        this.endingFrame = 1;
        this.endingTimer = millis();

        // Calcula pontuação baseada em tempo e erros
        var elapsedTime = millis() - this.runStartTime;
        var baseScore = 100;

        // Bônus/penalidade por tempo (quanto mais rápido, melhor)
        // < 2s = +30, 2-4s = +15, 4-6s = 0, > 6s = -20
        var timeBonus = 0;
        if (elapsedTime < 2000) {
          timeBonus = 30;
        } else if (elapsedTime < 4000) {
          timeBonus = 15;
        } else if (elapsedTime < 6000) {
          timeBonus = 0;
        } else {
          timeBonus = -20;
        }

        // Penalidade por erros (cada erro = -15 pontos)
        var errorPenalty = this.wrongKeyCount * 15;

        this.score = Math.max(0, baseScore + timeBonus - errorPenalty);
        console.log(
          "GoblinGame: Score calculado:",
          this.score,
          "(tempo:",
          Math.round(elapsedTime) + "ms, erros:",
          this.wrongKeyCount + ")"
        );

        // Para sons de corrida
        this.soundWaiting.pause();
        this.soundFootstep.pause();
        // Toca punch (sucesso)
        this.soundPunch.currentTime = 0;
        this.soundPunch.volume = 0.8;
        this.soundPunch.play().catch((e) => {});
        this.endingSoundPlaying = this.soundPunch; // guarda referência
        // Mostra primeiro frame do final bom
        if (this.bgElement) {
          this.bgElement.src = "IMGS/final_bom1.png";
        }
        console.log("GoblinGame: SUCESSO! Escapou do goblin!");
      }
    }
  } else {
    // Tecla errada! Conta como erro
    this.wrongKeyCount++;
    console.log(
      "GoblinGame: Tecla errada!",
      pressedKey,
      "(" + this.wrongKeyCount + "/" + this.maxMistakes + ")"
    );

    // Verifica se errou demais
    if (this.wrongKeyCount >= this.maxMistakes) {
      this.state = "fail_anim";
      this.mistakes = this.maxMistakes;
      this.endingFrame = 1;
      this.endingTimer = millis();
      // Para sons de corrida
      this.soundWaiting.pause();
      this.soundFootstep.pause();
      // Toca growl (falha)
      this.soundGrowl.currentTime = 0;
      this.soundGrowl.volume = 1.0;
      this.soundGrowl.play().catch((e) => {});
      this.endingSoundPlaying = this.soundGrowl; // guarda referência
      // Mostra primeiro frame do final ruim
      if (this.bgElement) {
        this.bgElement.src = "IMGS/finalmau1.png";
      }
      console.log("GoblinGame: FALHOU! Muitos erros de tecla!");
    }
  }
};

// ============================================================
// cleanup: limpa recursos ao sair do minigame
// ============================================================
GoblinGame.prototype.cleanup = function () {
  this.removeBackground();
  // Para todos os sons
  this.soundWaiting.pause();
  this.soundFootstep.pause();
  this.soundGrowl.pause();
  this.soundPunch.pause();
  // Reseta flags
  this.waitingForAudio = false;
  this.endingSoundPlaying = null;
};

// ============================================================
// Exporta para Node (caso use testes)
// ============================================================
try {
  module.exports = GoblinGame;
} catch (e) {}
