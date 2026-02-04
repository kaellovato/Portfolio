// ============================================================
// GameOver — Tela de Fim de Jogo
// ============================================================
// Exibida quando o jogador perde todas as 4 vidas.
// Mostra uma animação do personagem chorando, a pontuação final,
// e um botão para voltar ao menu.
// ============================================================

class GameOver {
  constructor(totalMistakes, score, elapsedMs = 0, minigamesCompleted = 0) {
    // ============================================================
    // DADOS DO JOGO
    // ============================================================

    this.totalMistakes = totalMistakes; // Total de erros/vidas perdidas
    this.score = score; // Pontuação total acumulada
    this.elapsedMs = elapsedMs; // Tempo total de jogo em milissegundos
    this.minigamesCompleted = minigamesCompleted; // Quantidade de minigames passados SEM perder vida

    // ============================================================
    // ATUALIZA HIGHSCORE DO UTILIZADOR
    // ============================================================
    this.isNewHighscore = false;
    if (typeof updateHighscore === "function") {
      this.isNewHighscore = updateHighscore(this.score);
    }

    // ============================================================
    // CONTROLE DO BOTÃO
    // ============================================================

    this.buttonCreated = false; // Para criar o botão apenas uma vez

    // ============================================================
    // IMAGENS DO GAME OVER
    // ============================================================

    this.gameoverImg1 = null; // Frame 1 da animação (chorando)
    this.gameoverImg2 = null; // Frame 2 da animação (chorando)
    this.gameoverText = null; // Texto "GAME OVER"
    this.imagesLoaded = false; // Flag de carregamento

    // ============================================================
    // ANIMAÇÃO DO PERSONAGEM
    // ============================================================
    // Alterna entre gameoverImg1 e gameoverImg2 para criar animação
    // ============================================================

    this.currentFrame = 0; // Frame atual (0 ou 1)
    this.lastFrameSwitch = 0; // Timestamp da última troca
    this.frameSwitchInterval = 400; // <-- ALTERE AQUI: ms entre frames da animação

    // ============================================================
    // SOM DO GAME OVER
    // ============================================================

    this.gameoverSound = new Audio("SFX/GameOver.mp3");
    this.gameoverSound.volume = 0.6; // <-- ALTERE AQUI: Volume do som (0.0 a 1.0)
    this.gameoverSound.play().catch((e) => {}); // Toca automaticamente

    // Carrega as imagens
    this.loadImages();
  }

  // ============================================================
  // loadImages: Carrega as imagens do Game Over
  // ============================================================
  loadImages() {
    // Carrega as imagens de fundo e texto do game over
    this.gameoverImg1 = loadImage("IMGS/gameover1.png", () => {
      this.checkAllImagesLoaded();
    });
    this.gameoverImg2 = loadImage("IMGS/gameover2.png", () => {
      this.checkAllImagesLoaded();
    });
    this.gameoverText = loadImage("IMGS/GAMEOVER.png", () => {
      this.checkAllImagesLoaded();
    });
  }

  // ============================================================
  // checkAllImagesLoaded: Verifica se todas as imagens carregaram
  // ============================================================
  checkAllImagesLoaded() {
    if (this.gameoverImg1 && this.gameoverImg2 && this.gameoverText) {
      this.imagesLoaded = true;
    }
  }

  // ============================================================
  // draw: Desenha a tela de Game Over
  // ============================================================
  draw() {
    // Fundo com cor do tema (#313131)
    background(49, 49, 49);

    // --- ATUALIZA ANIMAÇÃO ---
    // Alterna entre os frames a cada frameSwitchInterval ms
    const now = millis();
    if (now - this.lastFrameSwitch > this.frameSwitchInterval) {
      this.currentFrame = (this.currentFrame + 1) % 2;
      this.lastFrameSwitch = now;
    }

    // --- DESENHA SE AS IMAGENS CARREGARAM ---
    if (this.imagesLoaded) {
      // Garante que as imagens sejam centralizadas
      imageMode(CENTER);

      // --- TEXTO "GAME OVER" ---
      // Posicionado no topo central da tela
      const textHeight = height * 0.25; // <-- ALTERE AQUI: 25% da altura da tela
      const textWidth =
        (this.gameoverText.width / this.gameoverText.height) * textHeight;
      const textX = width / 2;
      const textY = 150; // <-- ALTERE AQUI: Distância do topo

      image(this.gameoverText, textX, textY, textWidth, textHeight);

      // --- PERSONAGEM CHORANDO (ANIMADO) ---
      // Centralizado abaixo do texto
      const currentImg =
        this.currentFrame === 0 ? this.gameoverImg1 : this.gameoverImg2;

      const charHeight = height * 0.25; // <-- ALTERE AQUI: 25% da altura da tela
      const charWidth = (currentImg.width / currentImg.height) * charHeight;

      const charX = width / 2;
      const charY = textY + textHeight + 70; // Logo abaixo do texto GAME OVER

      image(currentImg, charX, charY, charWidth, charHeight);

      // --- PONTUAÇÃO FINAL ---
      // Exibe a pontuação total do jogador
      fill(255); // Texto branco para contrastar com fundo escuro
      textSize(36); // <-- ALTERE AQUI: Tamanho da fonte
      textFont("Monogram"); // Fonte personalizada
      textAlign(CENTER, CENTER);

      const scoreY = charY + charHeight + 50;
      text("Score: " + this.score, width / 2, scoreY);

      // --- NOVO RECORDE ---
      if (this.isNewHighscore) {
        fill(240, 192, 64); // Dourado
        textSize(28);
        text("★ NOVO RECORDE! ★", width / 2, scoreY + 40);
      }

      // --- NOME DO UTILIZADOR ---
      const user =
        typeof getCurrentUser === "function" ? getCurrentUser() : null;
      if (user) {
        fill(180);
        textSize(24);
        const userY = this.isNewHighscore ? scoreY + 75 : scoreY + 40;
        text("Jogador: " + user.name, width / 2, userY);
      }

      // --- BOTÃO "MENU" COM IMAGEM ---
      // Cria o botão com imagem apenas uma vez
      if (!this.buttonCreated) {
        const btnY = this.isNewHighscore ? scoreY + 110 : scoreY + 70;
        const btnImg = createImg("IMGS/menubotao.png", "Menu");
        btnImg.id("gameOverBtn");
        btnImg.style("cursor", "pointer");
        btnImg.style("width", "200px"); // <-- ALTERE AQUI: Largura do botão
        btnImg.style("height", "auto");
        btnImg.style("transition", "transform 0.1s ease");
        btnImg.position(width / 2 - 100, btnY);

        // Efeito hover
        btnImg.mouseOver(() => {
          btnImg.style("transform", "scale(1.1)");
        });
        btnImg.mouseOut(() => {
          btnImg.style("transform", "scale(1)");
        });

        btnImg.mousePressed(() => {
          // Remove o botão antes de voltar ao menu
          btnImg.remove();
          window.location.href = "Index.html"; // Volta à tela inicial
        });
        this.buttonCreated = true;
      }
    } else {
      // --- FALLBACK ENQUANTO CARREGA ---
      // Exibe texto simples se as imagens ainda não carregaram
      fill(255, 50, 50);
      textSize(60);
      textAlign(CENTER, CENTER);
      text("GAME OVER", width / 2, height / 2 - 100);
    }
  }
}
