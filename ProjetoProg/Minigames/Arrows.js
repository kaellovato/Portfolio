// ============================================================
// ArrowGame — Minigame de Setas
// ============================================================

function ArrowGame() {
  // --- FLAGS DE ESTADO ---
  this.finished = false; // true quando o minigame termina
  this.mistakes = 0; // contador de erros
  this.maxMistakes = 3; // máximo de erros permitidos (3 erros = game over)

  // --- IMAGEM DE FUNDO ---
  // window.bgGame é carregada em sketch.js no preload()
  this.bg = window.bgGame || null;

  // --- TAMANHO DO CANVAS ---
  this._w = windowWidth;
  this._h = windowHeight;

  // ============================================================
  // CONFIGURAÇÕES DE FÁCIL ALTERAÇÃO
  // ============================================================

  // ARROW_SIZE: tamanho das setas (pixels). Aumente para setas maiores.
  this.ARROW_SIZE = 120; // <-- ALTERE AQUI para mudar o tamanho das setas

  // BLOCK_HEIGHT: altura do bloco na parte de baixo da tela.
  // As setas e o overlay ficarão centralizados verticalmente neste bloco.
  this.BLOCK_HEIGHT = 200; // <-- ALTERE AQUI para mudar a altura do bloco inferior

  // HIT_Y: posição vertical (Y) do overlay/hitbox.
  // Calculado automaticamente para ficar no centro do bloco inferior.
  this.HIT_Y = this._h - this.BLOCK_HEIGHT / 2; // centro do bloco inferior

  // OVERLAY_SIZE: tamanho do overlay (quadrado) no ponto de encontro.
  this.OVERLAY_SIZE = 140; // <-- ALTERE AQUI para mudar o tamanho do overlay

  // MAX_ARROWS: máximo de pares de setas na tela ao mesmo tempo.
  this.MAX_ARROWS = 9; // <-- ALTERE AQUI para mudar o limite de setas

  // HITS_TO_WIN: quantos acertos são necessários para passar o minigame.
  // Quando o jogador acerta esse número de setas, o minigame termina com SUCESSO.
  this.HITS_TO_WIN = 3; // <-- ALTERE AQUI para mudar quantos acertos para vencer

  // BASE_SPAWN_INTERVAL: intervalo base (ms) entre spawns de setas.
  // Será dividido pelo speedMultiplier para ficar mais rápido.
  this.BASE_SPAWN_INTERVAL = 1200; // <-- ALTERE AQUI para mudar o intervalo base

  // BASE_SPEED: velocidade base das setas (pixels/frame).
  // Será multiplicada pelo speedMultiplier para ficar mais rápido.
  this.BASE_SPEED = 5; // <-- ALTERE AQUI para mudar a velocidade base

  // ============================================================
  // VARIÁVEIS INTERNAS (não precisa alterar)
  // ============================================================
  this.pairs = []; // array de pares de setas ativos
  this._lastSpawn = 0; // timestamp do último spawn
  this.hits = 0; // contador de acertos (para estatísticas)

  // Velocidade e intervalo atuais (ajustados pelo speedMultiplier)
  this.currentSpeed = this.BASE_SPEED;
  this.currentSpawnInterval = this.BASE_SPAWN_INTERVAL;
  this.hitZone = {
    // hitbox quadrada do overlay
    x: this._w / 2,
    y: this.HIT_Y,
    size: this.OVERLAY_SIZE,
  };

  // Delay para esperar animação do Plugie antes de mudar de minigame
  this.winDelay = 500; // milissegundos para esperar após vencer
  this.winTime = 0; // timestamp de quando venceu
  this.won = false; // flag para indicar que venceu mas está esperando animação

  // Sistema de pontuação
  this.score = 0; // pontuação deste minigame

  // ============================================================
  // SONS
  // ============================================================
  this.bgMusic = new Audio("SFX/ArrowsBackMusic.mp3");
  this.bgMusic.loop = true;
  this.bgMusic.volume = 0.3;

  this.soundLeft = new Audio("SFX/Arrows_Left.mp3");
  this.soundRight = new Audio("SFX/Arrows_Right.mp3");
  this.soundUp = new Audio("SFX/Arrows_Up.mp3");
  this.soundDown = new Audio("SFX/Arrows_Down.mp3");
  this.soundWrong = new Audio("SFX/Arrows_Wrong.mp3");

  this.soundLeft.volume = 0.7;
  this.soundRight.volume = 0.7;
  this.soundUp.volume = 0.7;
  this.soundDown.volume = 0.7;
  this.soundWrong.volume = 0.4;

  // Sons de vitória e derrota
  this.soundWin = new Audio("SFX/Arrows_Win.mp3");
  this.soundLose = new Audio("SFX/Arrows_Lose.mp3");
  this.soundWin.volume = 1.0; // Volume máximo para vitória
  this.soundLose.volume = 0.7;

  // Flags para esperar som de erro terminar
  this.waitingForErrorSound = false;
  this.errorSoundPlaying = null;

  // ============================================================
  // ANIMAÇÃO DE VITÓRIA/DERROTA
  // ============================================================
  this.showingEndAnimation = false; // se está mostrando animação final
  this.endAnimationType = null; // 'win' ou 'lose'
  this.endAnimationFrame = 0; // frame atual da animação
  this.endAnimationTimer = 0; // timer para trocar frames
  this.endAnimationInterval = 300; // intervalo entre frames (ms)
  this.endAnimationDuration = 2000; // duração total da animação (ms)
  this.endAnimationStartTime = 0; // quando começou a animação

  // Carregar imagens de animação
  this.bgMau = loadImage("IMGS/bgmau.png");
  this.bgGanhar = loadImage("IMGS/ganharbg.png");

  this.loseFrames = [
    loadImage("IMGS/lose1.png"),
    loadImage("IMGS/lose2.png"),
    loadImage("IMGS/lose3.png"),
    loadImage("IMGS/lose4.png"),
  ];

  this.winFrames = [
    loadImage("IMGS/ganhar1.png"),
    loadImage("IMGS/ganhar2.png"),
    loadImage("IMGS/ganhar3.png"),
  ];
}

// ============================================================
// onResize: chamado quando a janela é redimensionada
// ============================================================
ArrowGame.prototype.onResize = function (w, h) {
  this._w = w;
  this._h = h;
  // Recalcula HIT_Y para ficar no centro do bloco inferior
  this.HIT_Y = this._h - this.BLOCK_HEIGHT / 2;
  // Atualiza a posição X do hitZone para ficar centralizado
  this.hitZone.x = this._w / 2;
  this.hitZone.y = this.HIT_Y;
  this.hitZone.size = this.OVERLAY_SIZE;
};

// ============================================================
// capitalize: utilitário para transformar "left" em "Left"
// ============================================================
function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================
// start: reinicia o estado do minigame
// ============================================================
// Recebe speedMultiplier do GameManager.
// speedMultiplier aumenta cada vez que o jogador completa todos os minigames.
// Isso faz as setas ficarem mais rápidas e spawnarem mais frequentemente.
// ============================================================
ArrowGame.prototype.start = function (speedMultiplier) {
  // Se não receber speedMultiplier, usa 1 (velocidade normal)
  speedMultiplier = speedMultiplier || 1;

  // Reseta flags de estado
  this.finished = false;
  this.mistakes = 0;
  this.hits = 0;
  this.pairs = [];
  this._lastSpawn = millis();
  this.won = false; // reseta flag de vitória
  this.winTime = 0; // reseta timestamp de vitória
  this.score = 0; // reseta pontuação

  // Reseta estado da animação final
  this.showingEndAnimation = false;
  this.endAnimationType = null;
  this.endAnimationFrame = 0;
  this.endAnimationTimer = 0;
  this.endAnimationStartTime = 0;

  // Inicia música de fundo
  this.bgMusic.currentTime = 0;
  this.bgMusic.play().catch(function () {});

  // Recalcula HIT_Y para garantir posição correta no bloco inferior
  this.HIT_Y = this._h - this.BLOCK_HEIGHT / 2;

  // Aplica o multiplicador de velocidade do GameManager
  // Velocidade aumenta: BASE_SPEED * speedMultiplier
  this.currentSpeed = this.BASE_SPEED * speedMultiplier;

  // Intervalo de spawn diminui: BASE_SPAWN_INTERVAL / speedMultiplier
  // Isso faz as setas aparecerem mais rápido conforme a dificuldade aumenta
  this.currentSpawnInterval = this.BASE_SPAWN_INTERVAL / speedMultiplier;

  // Log para debug (pode remover depois)
  console.log("ArrowGame started with speedMultiplier:", speedMultiplier);
  console.log("  currentSpeed:", this.currentSpeed);
  console.log("  currentSpawnInterval:", this.currentSpawnInterval);
};

// ============================================================
// update: lógica de spawn e movimento das setas
// ============================================================
ArrowGame.prototype.update = function () {
  // Se já terminou, não atualiza
  if (this.finished) return;

  // Se está esperando som de erro terminar
  if (this.waitingForErrorSound) {
    if (this.errorSoundPlaying && this.errorSoundPlaying.ended) {
      // Esconde o Plugie antes de iniciar a animação de derrota
      if (typeof hidePlugieHUD === "function") hidePlugieHUD();

      // Toca som de derrota
      this.soundLose.currentTime = 0;
      this.soundLose.play().catch(function () {});

      // Inicia animação de derrota
      this.showingEndAnimation = true;
      this.endAnimationType = "lose";
      this.endAnimationFrame = 0;
      this.endAnimationTimer = millis();
      this.endAnimationStartTime = millis();
      this.waitingForErrorSound = false;
      console.log(
        "ArrowGame: PERDEU após erro! Iniciando animação de derrota."
      );
    }
    return; // não atualiza mais nada enquanto espera
  }

  // Se está mostrando animação final (win ou lose)
  if (this.showingEndAnimation) {
    var now = millis();

    // Atualiza frame da animação
    if (now - this.endAnimationTimer >= this.endAnimationInterval) {
      this.endAnimationTimer = now;
      var frames =
        this.endAnimationType === "win" ? this.winFrames : this.loseFrames;

      // Se for animação de perder, só avança se ainda não chegou no último frame
      if (this.endAnimationType === "lose") {
        if (this.endAnimationFrame < frames.length - 1) {
          this.endAnimationFrame++;
        }
        // Quando chegar no último frame, termina o minigame
        else {
          this.finished = true;
          console.log(
            "ArrowGame: Animação de derrota finalizada. Finished = true"
          );
        }
      } else {
        // Animação de vitória continua com loop
        this.endAnimationFrame = (this.endAnimationFrame + 1) % frames.length;

        // Verifica se a animação terminou por tempo
        if (now - this.endAnimationStartTime >= this.endAnimationDuration) {
          this.finished = true;
          console.log(
            "ArrowGame: Animação de vitória finalizada. Finished = true"
          );
        }
      }
    }
    return; // não atualiza mais nada durante animação
  }

  // Se venceu, espera o delay e depois inicia animação
  if (this.won) {
    if (millis() - this.winTime >= this.winDelay) {
      // Esconde o Plugie antes de iniciar a animação de vitória
      if (typeof hidePlugieHUD === "function") hidePlugieHUD();

      // Toca som de vitória
      this.soundWin.currentTime = 0;
      this.soundWin.play().catch(function () {});

      // Inicia animação de vitória
      this.showingEndAnimation = true;
      this.endAnimationType = "win";
      this.endAnimationFrame = 0;
      this.endAnimationTimer = millis();
      this.endAnimationStartTime = millis();
      this.won = false; // reseta para não entrar aqui de novo
      console.log("ArrowGame: VITÓRIA! Iniciando animação de vitória.");
    }
    return; // não atualiza mais nada enquanto espera
  }

  var now = millis();

  // --- SPAWN de pares de setas ---
  // Só spawna se ainda não atingiu o limite de setas
  // Usa currentSpawnInterval (ajustado pelo speedMultiplier do GameManager)
  if (this.pairs.length < this.MAX_ARROWS) {
    if (now - this._lastSpawn >= this.currentSpawnInterval) {
      this._lastSpawn = now;
      // Cria um novo par de setas (esquerda e direita)
      this.pairs.push({
        leftX: -this.ARROW_SIZE, // começa fora da tela à esquerda
        rightX: this._w + this.ARROW_SIZE, // começa fora da tela à direita
        y: this.HIT_Y, // altura do overlay
        type: random(["left", "down", "up", "right"]), // tipo de seta (qual imagem usar)
        done: false, // se já foi avaliada (hit ou miss)
      });
    }
  }

  // --- MOVIMENTO das setas em direção ao centro ---
  // Usa currentSpeed (ajustado pelo speedMultiplier do GameManager)
  for (var i = this.pairs.length - 1; i >= 0; i--) {
    var p = this.pairs[i];
    if (p.done) continue;

    // Move a seta esquerda para a direita (velocidade controlada pelo GameManager)
    p.leftX += this.currentSpeed;
    // Move a seta direita para a esquerda (velocidade controlada pelo GameManager)
    p.rightX -= this.currentSpeed;

    // --- DETECÇÃO DE ERRO (MISS) ---
    // Se as setas passaram do centro sem serem pressionadas, conta como erro
    var centerX = this._w / 2;
    var margin = this.OVERLAY_SIZE / 2 + this.ARROW_SIZE / 2;
    if (p.leftX > centerX + margin || p.rightX < centerX - margin) {
      // As setas passaram do overlay sem acerto
      this.mistakes++;
      p.done = true;
      // Remove o par da lista
      this.pairs.splice(i, 1);

      // Verifica se atingiu o máximo de erros
      if (this.mistakes >= this.maxMistakes) {
        // Toca som de erro e espera terminar
        this.soundWrong.currentTime = 0;
        this.soundWrong.play().catch(function () {});
        this.errorSoundPlaying = this.soundWrong;
        this.waitingForErrorSound = true;
        this.bgMusic.pause();
      }
    }
  }
};

// ============================================================
// draw: desenha o fundo, overlay e setas (imagens)
// ============================================================
ArrowGame.prototype.draw = function () {
  // --- SE ESTÁ MOSTRANDO ANIMAÇÃO FINAL ---
  if (this.showingEndAnimation) {
    // Limpa tudo - tela preta primeiro
    background(0);

    // Se for vitória, desenha o background de ganhar primeiro
    if (this.endAnimationType === "win" && this.bgGanhar) {
      imageMode(CORNER);
      image(this.bgGanhar, 0, 0, this._w, this._h);
    }

    // Desenha o frame atual da animação em TELA CHEIA
    var frames =
      this.endAnimationType === "win" ? this.winFrames : this.loseFrames;
    var currentFrame = frames[this.endAnimationFrame];

    if (currentFrame) {
      imageMode(CORNER);
      // Desenha a animação ocupando a tela inteira
      image(currentFrame, 0, 0, this._w, this._h);
    }

    return; // não desenha mais nada durante a animação
  }

  // --- FUNDO (sobe um pouco, fica acima do bloco inferior) ---
  if (this.bg) {
    imageMode(CORNER);
    // Desenha o fundo ocupando a área acima do bloco inferior
    image(this.bg, 0, 0, this._w, this._h - this.BLOCK_HEIGHT);
  } else {
    background(30);
  }

  // --- BLOCO INFERIOR (onde ficam as setas e o overlay) ---
  push();
  fill(40); // cor escura para o bloco
  noStroke();
  rect(0, this._h - this.BLOCK_HEIGHT, this._w, this.BLOCK_HEIGHT);
  pop();

  // --- OVERLAY (hitbox visual) ---
  // Desenha o overlay no centro do bloco inferior
  imageMode(CENTER);
  if (window.hitOverlay) {
    // Se a imagem do overlay foi carregada, desenha ela
    image(
      window.hitOverlay,
      this._w / 2,
      this.HIT_Y,
      this.OVERLAY_SIZE,
      this.OVERLAY_SIZE
    );
  } else {
    // Fallback: desenha um quadrado branco semi-transparente
    push();
    rectMode(CENTER);
    noFill();
    stroke(255, 200);
    strokeWeight(3);
    rect(this._w / 2, this.HIT_Y, this.OVERLAY_SIZE, this.OVERLAY_SIZE);
    pop();
  }

  // --- DESENHA CADA PAR DE SETAS ---
  for (var i = 0; i < this.pairs.length; i++) {
    var p = this.pairs[i];
    if (p.done) continue;

    // Escolhe a imagem da seta pelo tipo (left, down, up, right)
    // As imagens são carregadas em sketch.js: window.arrowLeft, window.arrowRight, etc.
    var imgL = window["arrow" + capitalize(p.type)] || window.arrowLeft;
    var imgR =
      window["arrow" + capitalize(p.type)] || window.arrowRight || imgL;

    // --- SETA ESQUERDA (vem da esquerda, vai para o centro) ---
    push();
    imageMode(CENTER);
    if (imgL) {
      // Desenha a imagem da seta esquerda
      image(imgL, p.leftX, p.y, this.ARROW_SIZE, this.ARROW_SIZE);
    } else {
      // Fallback: texto
      fill(255);
      textSize(this.ARROW_SIZE * 0.5);
      textAlign(CENTER, CENTER);
      text("←", p.leftX, p.y);
    }
    pop();

    // --- SETA DIREITA (vem da direita, vai para o centro, DUPLICADA, não espelhada) ---
    push();
    imageMode(CENTER);
    if (imgR) {
      // Desenha a imagem da seta direita (igual à esquerda, sem espelhar)
      image(imgR, p.rightX, p.y, this.ARROW_SIZE, this.ARROW_SIZE);
    } else {
      // Fallback: texto
      fill(255);
      textSize(this.ARROW_SIZE * 0.5);
      textAlign(CENTER, CENTER);
      text("→", p.rightX, p.y);
    }
    pop();
  }

  // HUD removido - vidas serão gerenciadas pelo GameManager
};

// ============================================================
// keyPressed: detecta teclas e verifica acerto
// ============================================================
// REGRAS:
//   - Só pode acertar se AMBAS as setas estiverem dentro do overlay.
//   - Se apertar a tecla errada OU fora do timing, conta como ERRO.
// ============================================================
ArrowGame.prototype.keyPressed = function () {
  // Se já terminou, ignora
  if (this.finished) return;

  // Se já perdeu ou está mostrando animação, bloqueia toda interação
  if (this.waitingForErrorSound || this.showingEndAnimation || this.won) return;

  // Mapeia teclas para tipos de seta
  var keyMap = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  };
  var pressedType = keyMap[key] || keyMap["Arrow" + capitalize(key)] || null;

  // Se não for uma tecla de seta, ignora (não conta erro)
  if (!pressedType) return;

  // --- VERIFICA SE ALGUM PAR ESTÁ DENTRO DO OVERLAY ---
  var centerX = this._w / 2;
  var halfOverlay = this.OVERLAY_SIZE / 2;
  // Limites do overlay (em X)
  var overlayLeft = centerX - halfOverlay;
  var overlayRight = centerX + halfOverlay;

  for (var i = 0; i < this.pairs.length; i++) {
    var p = this.pairs[i];
    if (p.done) continue;

    // Verifica se AMBAS as setas estão dentro do overlay
    // Seta esquerda: p.leftX deve estar >= overlayLeft
    // Seta direita: p.rightX deve estar <= overlayRight
    var leftInside = p.leftX >= overlayLeft && p.leftX <= overlayRight;
    var rightInside = p.rightX >= overlayLeft && p.rightX <= overlayRight;
    var bothInside = leftInside && rightInside;

    if (bothInside) {
      // Está no timing certo
      if (p.type === pressedType) {
        // ACERTO! Tecla correta no timing certo
        this.hits++; // incrementa contador de acertos
        p.done = true;
        this.pairs.splice(i, 1);

        // Toca som da direção correta
        if (p.type === "left") {
          this.soundLeft.currentTime = 0;
          this.soundLeft.play().catch(function () {});
        } else if (p.type === "right") {
          this.soundRight.currentTime = 0;
          this.soundRight.play().catch(function () {});
        } else if (p.type === "up") {
          this.soundUp.currentTime = 0;
          this.soundUp.play().catch(function () {});
        } else if (p.type === "down") {
          this.soundDown.currentTime = 0;
          this.soundDown.play().catch(function () {});
        }

        // Anima o Plugie na direção correta
        if (typeof animatePlugie === "function") {
          animatePlugie(p.type); // p.type é "left", "right", "up" ou "down"
        }

        // Verifica se atingiu o número de acertos para vencer
        // Se sim, inicia o delay para esperar a animação do Plugie
        if (this.hits >= this.HITS_TO_WIN) {
          this.won = true;
          this.winTime = millis();
          this.bgMusic.pause(); // para a música ao vencer

          // Calcula pontuação baseada em erros
          // 0 erros = 100 pontos, 1 erro = 70 pontos, 2 erros = 40 pontos
          if (this.mistakes === 0) {
            this.score = 100;
          } else if (this.mistakes === 1) {
            this.score = 70;
          } else if (this.mistakes === 2) {
            this.score = 40;
          } else {
            this.score = 0;
          }
          console.log(
            "ArrowGame: Score calculado:",
            this.score,
            "(erros:",
            this.mistakes,
            ")"
          );
        }

        return; // só conta um acerto por vez
      } else {
        // ERRO! Tecla errada, mas estava no timing
        this.soundWrong.currentTime = 0;
        this.soundWrong.play().catch(function () {});
        this.mistakes++;
        p.done = true;
        this.pairs.splice(i, 1);
        if (this.mistakes >= this.maxMistakes) {
          this.errorSoundPlaying = this.soundWrong;
          this.waitingForErrorSound = true;
          this.bgMusic.pause(); // para a música ao perder
        }
        return;
      }
    }
  }

  // Se chegou aqui, nenhum par estava dentro do overlay
  // Isso significa que apertou fora do timing = ERRO
  this.soundWrong.currentTime = 0;
  this.soundWrong.play().catch(function () {});
  this.mistakes++;
  if (this.mistakes >= this.maxMistakes) {
    this.errorSoundPlaying = this.soundWrong;
    this.waitingForErrorSound = true;
    this.bgMusic.pause(); // para a música ao perder
  }
};

// ============================================================
// cleanup: para todos os sons do minigame
// ============================================================
ArrowGame.prototype.cleanup = function () {
  this.bgMusic.pause();
  this.soundLeft.pause();
  this.soundRight.pause();
  this.soundUp.pause();
  this.soundDown.pause();
  this.soundWrong.pause();
  this.soundWin.pause();
  this.soundLose.pause();
  this.waitingForErrorSound = false;
  this.errorSoundPlaying = null;
};

// ============================================================
// Exporta para Node (caso use testes)
// ============================================================
try {
  module.exports = ArrowGame;
} catch (e) {}
