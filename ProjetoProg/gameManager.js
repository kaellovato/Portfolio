// ============================================================
// GameManager — Gerenciador Principal do Jogo
// ============================================================
// Controla o fluxo do jogo:
// - Gerencia a lista de minigames
// - Controla vidas do jogador (4 vidas)
// - Aumenta dificuldade progressivamente
// - Acumula pontuação total
// - Exibe Game Over quando vidas acabam
// ============================================================

class GameManager {
  constructor() {
    // ============================================================
    // LISTA DE MINIGAMES
    // ============================================================

    this.minigames = []; // Array com todos os minigames adicionados
    this.current = 0; // Índice do minigame atual sendo jogado

    // ============================================================
    // SISTEMA DE DIFICULDADE PROGRESSIVA
    // ============================================================
    // A cada rodada completa (todos os minigames jogados), a velocidade aumenta.
    // speedMultiplier é passado para cada minigame no start().
    // ============================================================

    this.speedMultiplier = 1; // <-- ALTERE AQUI: Multiplicador inicial (1 = normal)
    this.completed = 0; // Contador de quantos minigames foram completados no total

    // ============================================================
    // SISTEMA DE VIDAS GLOBAL
    // ============================================================
    // O jogador tem 4 vidas no total.
    // A cada minigame perdido (mistakes >= maxMistakes), perde 1 vida.
    // Quando as vidas chegam a 0, é Game Over.
    // ============================================================

    this.lives = 4; // <-- ALTERE AQUI: Vidas atuais
    this.maxLives = 4; // <-- ALTERE AQUI: Vidas máximas (para exibição)

    // ============================================================
    // CONTROLE DE TEMPO E ESTADO
    // ============================================================

    this.startTime = 0; // Timestamp de início do jogo (milissegundos)
    this.gameStarted = false; // Se o jogo está em andamento

    // ============================================================
    // SISTEMA DE PONTUAÇÃO
    // ============================================================

    this.perfectCompleted = 0; // Minigames passados SEM perder vida
    this.totalScore = 0; // Pontuação total acumulada de todos os minigames

    // ============================================================
    // TELA DE GAME OVER
    // ============================================================

    this.gameOver = null; // Referência à instância de GameOver (quando ativa)
  }

  // ============================================================
  // addMinigame: Adiciona um minigame à lista
  // ============================================================
  // Cada minigame deve implementar:
  // - start(speedMultiplier): Inicia/reinicia o minigame
  // - update(): Atualiza lógica a cada frame
  // - draw(): Desenha na tela
  // - finished: Boolean indicando se terminou
  // - mistakes: Número de erros cometidos
  // - maxMistakes: Número máximo de erros permitidos
  // - score: Pontuação obtida (opcional)
  // - cleanup(): Para sons (opcional)
  // ============================================================
  addMinigame(minigame) {
    this.minigames.push(minigame);
  }

  // ============================================================
  // start: Inicia o jogo e o primeiro minigame
  // ============================================================
  start() {
    this.gameStarted = true;
    this.startTime = millis(); // Marca o tempo de início
    this.completed = 0;
    this.perfectCompleted = 0; // Reseta minigames perfeitos
    this.totalScore = 0; // Reseta pontuação total
    this.current = 0;
    this.speedMultiplier = 1;
    this.lives = this.maxLives; // Reseta vidas para 4
    this.gameOver = null; // Limpa Game Over anterior

    // Mostra e atualiza o HUD de vidas (GIFs)
    if (typeof showLivesHUD === "function") showLivesHUD();
    if (typeof updateLivesHUD === "function") updateLivesHUD(this.lives);

    // Mostra o Plugie (bichinho que dança)
    if (typeof showPlugieHUD === "function") showPlugieHUD();
    if (typeof resetPlugieToIdle === "function") resetPlugieToIdle();

    // Inicia o primeiro minigame
    this.minigames[this.current].start(this.speedMultiplier);

    console.log("GameManager: Jogo iniciado!");
  }

  // ============================================================
  // update: Atualiza a lógica do jogo a cada frame
  // ============================================================
  update() {
    // Se o jogo ainda não começou, não faz nada
    if (!this.gameStarted) return;

    const current = this.minigames[this.current];

    // Atualiza o minigame atual
    current.update();

    // Verifica se o minigame atual terminou
    if (current.finished) {
      // --- VERIFICAÇÃO DE DERROTA ---
      // Se o jogador atingiu o número máximo de erros do minigame
      if (current.mistakes >= current.maxMistakes) {
        // Perde 1 vida
        this.lives--;
        console.log(
          "GameManager: Minigame perdido! Vidas restantes:",
          this.lives
        );

        // Atualiza o HUD de vidas (troca GIF por imagem morta)
        if (typeof updateLivesHUD === "function") updateLivesHUD(this.lives);

        // --- GAME OVER ---
        // Verifica se acabaram as vidas
        if (this.lives <= 0) {
          this.gameStarted = false;
          const elapsedMs = millis() - this.startTime;

          // Limpa recursos do minigame atual (sons, etc)
          if (typeof current.cleanup === "function") {
            current.cleanup();
          }

          // Esconde o HUD de vidas e o Plugie
          if (typeof hideLivesHUD === "function") hideLivesHUD();
          if (typeof hidePlugieHUD === "function") hidePlugieHUD();

          // Cria a tela de Game Over
          this.gameOver = new GameOver(
            this.maxLives, // Vidas perdidas (todas)
            this.totalScore, // Pontuação total acumulada
            elapsedMs, // Tempo total jogado
            this.perfectCompleted // Minigames passados sem perder vida
          );

          console.log("GameManager: GAME OVER! Score final:", this.totalScore);
          return;
        }
      } else {
        // --- VERIFICAÇÃO DE VITÓRIA ---
        // Jogador VENCEU este minigame (não atingiu maxMistakes)
        console.log("GameManager: Minigame vencido!");
        this.perfectCompleted++; // Incrementa minigames passados sem perder vida

        // Soma a pontuação do minigame à pontuação total
        if (typeof current.score === "number") {
          this.totalScore += current.score;
          console.log(
            "GameManager: Pontuação do minigame:",
            current.score,
            "| Total:",
            this.totalScore
          );
        }
      }

      // --- PRÓXIMO MINIGAME ---
      this.completed++;
      this.current++;

      // Se todos os minigames foram jogados, reinicia lista com aumento de dificuldade
      if (this.current >= this.minigames.length) {
        this.current = 0;
        this.speedMultiplier *= 1.2; // <-- ALTERE AQUI: Aumento de velocidade por rodada (+20%)
        console.log(
          "GameManager: Rodada completa! Novo speedMultiplier:",
          this.speedMultiplier
        );
      }

      // --- CONTROLE DO PLUGIE ---
      // O Plugie só aparece no ArrowGame (índice 0)
      if (this.current === 0) {
        if (typeof showPlugieHUD === "function") showPlugieHUD();
        if (typeof resetPlugieToIdle === "function") resetPlugieToIdle();
      } else {
        if (typeof hidePlugieHUD === "function") hidePlugieHUD();
      }

      // Limpa recursos do minigame anterior (sons, etc)
      if (typeof current.cleanup === "function") {
        current.cleanup();
      }

      // Inicia o próximo minigame com a dificuldade atual
      this.minigames[this.current].start(this.speedMultiplier);
    }
  }

  // ============================================================
  // draw: Desenha o minigame atual ou tela de Game Over
  // ============================================================
  draw() {
    if (this.gameStarted) {
      // Desenha o minigame atual
      this.minigames[this.current].draw();
      // Nota: Vidas são exibidas via HTML (GIFs animados), não precisam ser desenhadas aqui
    } else if (this.gameOver) {
      // Desenha a tela de Game Over
      this.gameOver.draw();
    }
  }

  // ============================================================
  // restart: Reinicia o jogo após Game Over
  // ============================================================
  restart() {
    this.start(); // Reinicia tudo do zero
  }

  // ============================================================
  // onResize: Notifica minigames sobre mudança de tamanho da tela
  // ============================================================
  onResize(newW, newH) {
    for (let mg of this.minigames) {
      if (typeof mg.onResize === "function") {
        mg.onResize(newW, newH);
      }
    }
  }
}
