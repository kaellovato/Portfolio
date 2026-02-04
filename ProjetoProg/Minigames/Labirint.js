// ============================================================
// LabirintGame — Minigame do Labirinto
// ============================================================
// O jogador deve navegar pelo labirinto usando as setas do teclado.
// Se tocar em uma parede, perde (jumpscare!).
// Se chegar na saída (bloco verde), vence.
// ============================================================

class LabirintGame {
  constructor() {
    // ============================================================
    // CONFIGURAÇÕES DE FÁCIL ALTERAÇÃO
    // ============================================================

    this.cellSize = 85; // <-- ALTERE AQUI: Tamanho de cada célula do labirinto (pixels)
    this.cols = 5; // <-- ALTERE AQUI: Número de colunas do labirinto
    this.rows = 6; // <-- ALTERE AQUI: Número de linhas do labirinto
    this.speed = 4; // <-- ALTERE AQUI: Velocidade base do jogador (pixels/frame)

    // ============================================================
    // VARIÁVEIS DO LABIRINTO
    // ============================================================

    this.grid = []; // Array de células (MazeCell) do labirinto
    this.stack = []; // Pilha para algoritmo de geração do labirinto

    // ============================================================
    // CONFIGURAÇÕES DO JOGADOR
    // ============================================================

    this.player = {
      x: 0, // Posição X atual do jogador
      y: 0, // Posição Y atual do jogador
      size: 36, // <-- ALTERE AQUI: Tamanho visual da imagem do jogador
      radius: 15, // <-- ALTERE AQUI: Raio do hitbox circular (menor que size/2 para perdão)
    };

    // ============================================================
    // FLAGS DE ESTADO DO MINIGAME
    // ============================================================

    this.finished = false; // true quando o minigame termina
    this.mistakes = 0; // Contador de erros (para GameManager)
    this.maxMistakes = 1; // <-- ALTERE AQUI: Bater na parede = perder

    // ============================================================
    // SISTEMA DE JUMPSCARE
    // ============================================================

    this.showJumpscare = false; // Se está mostrando o jumpscare
    this.jumpscareTimer = 0; // Frames restantes do jumpscare
    this.jumpscareFrame = 0; // Frame atual da animação (0, 1 ou 2)
    this.jumpscareLastSwitch = 0; // Timestamp da última troca de frame
    this.jumpscareSwitchInterval = 100; // <-- ALTERE AQUI: ms entre frames do jumpscare

    // ============================================================
    // SISTEMA DE VITÓRIA
    // ============================================================

    this.showWin = false; // Se está mostrando animação de vitória
    this.winTimer = 0; // Frames desde a vitória
    this.winAlpha = 0; // Opacidade da imagem (fade in)
    this.winScale = 0.5; // Escala da imagem (cresce suavemente)

    // ============================================================
    // SISTEMA DE PONTUAÇÃO
    // ============================================================

    this.score = 0; // Pontuação deste minigame
    this.startTime = 0; // Timestamp de início (para calcular tempo)

    // ============================================================
    // SONS DO MINIGAME
    // ============================================================
    // - MazeAmbient.mp3: Som ambiente (loop durante o jogo)
    // - Maze_Jumpscare.mp3: Som do jumpscare (ao bater na parede)
    // - Maze_Win.mp3: Som de vitória (ao chegar na saída)
    // ============================================================

    this.soundAmbient = new Audio("SFX/MazeAmbient.mp3");
    this.soundJumpscare = new Audio("SFX/Maze_Jumpscare.mp3");
    this.soundWin = new Audio("SFX/Maze_Win.mp3");
    this.soundAmbient.loop = true; // Som ambiente toca em loop

    // ============================================================
    // FLAGS PARA ESPERAR ÁUDIO TERMINAR
    // ============================================================

    this.waitingForAudio = false; // Se está aguardando áudio finalizar
    this.endingSoundPlaying = null; // Referência ao som que está tocando

    // ============================================================
    // IMAGENS DO MINIGAME
    // ============================================================

    this.playerImg = null; // Imagem do jogador
    this.jumpscareImgs = []; // Array com 3 imagens do jumpscare
    this.winImg = null; // Imagem de vitória
    this.imagesLoaded = false; // Flag de carregamento

    // Carrega imagens e calcula valores responsivos
    this.loadImages();
    this.updateResponsiveValues();
  }

  // ============================================================
  // loadImages: Carrega todas as imagens necessárias para o minigame
  // ============================================================
  loadImages() {
    // Carrega imagem do player (ícone do labirinto)
    this.playerImg = loadImage("IMGS/icone_do_labiringto.png", () => {
      this.checkImagesLoaded();
    });

    // Carrega as 3 imagens do jumpscare (para animação)
    this.jumpscareImgs[0] = loadImage("IMGS/Jumpscare1.png", () => {
      this.checkImagesLoaded();
    });
    this.jumpscareImgs[1] = loadImage("IMGS/Jumpscare2.png", () => {
      this.checkImagesLoaded();
    });
    this.jumpscareImgs[2] = loadImage("IMGS/Jumpscare3.png", () => {
      this.checkImagesLoaded();
    });

    // Carrega imagem de vitória
    this.winImg = loadImage("IMGS/ganhar_labirinto.png", () => {
      this.checkImagesLoaded();
    });
  }

  // ============================================================
  // checkImagesLoaded: Verifica se todas as imagens foram carregadas
  // ============================================================
  checkImagesLoaded() {
    if (this.playerImg && this.jumpscareImgs.length === 3 && this.winImg) {
      this.imagesLoaded = true;
    }
  }

  // ============================================================
  // updateResponsiveValues: Calcula posições baseadas no tamanho da tela
  // ============================================================
  updateResponsiveValues() {
    // Calcula offset para centralizar o labirinto na tela
    this.offsetX = (width - this.cols * this.cellSize) / 2;
    this.offsetY = (height - this.rows * this.cellSize) / 2;

    // Gera o labirinto
    this.generateGrid();
    this.generateMaze();

    // Garante que existe uma saída na última célula (canto inferior direito)
    let exitCell = this.grid[this.index(this.cols - 1, this.rows - 1)];
    exitCell.walls.bottom = false;

    // Posiciona o jogador no centro da primeira célula
    this.player.x = this.offsetX + this.cellSize / 2;
    this.player.y = this.offsetY + this.cellSize / 2;
  }

  // ============================================================
  // onResize: Chamado quando a janela é redimensionada
  // ============================================================
  onResize() {
    this.updateResponsiveValues();
  }

  // ============================================================
  // generateGrid: Cria o grid de células do labirinto
  // ============================================================
  generateGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid.push(
          new MazeCell(c, r, this.cellSize, this.offsetX, this.offsetY)
        );
      }
    }
    this.stack = [];
  }

  // ============================================================
  // index: Converte coordenadas (coluna, linha) para índice do array
  // ============================================================
  index(c, r) {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return c + r * this.cols;
  }

  // ============================================================
  // generateMaze: Gera o labirinto usando algoritmo de backtracking
  // ============================================================
  // Algoritmo: Recursive Backtracking
  // 1. Marca célula atual como visitada
  // 2. Enquanto houver células não visitadas:
  //    a. Escolhe vizinho não visitado aleatório
  //    b. Remove parede entre atual e vizinho
  //    c. Move para o vizinho
  //    d. Se não há vizinhos, volta (backtrack)
  // ============================================================
  generateMaze() {
    let current = this.grid[0];
    current.visited = true;

    while (true) {
      let next = current.checkNeighbors(
        this.grid,
        this.cols,
        this.rows,
        (c, r) => this.index(c, r)
      );
      if (next) {
        next.visited = true;
        this.stack.push(current);
        current.removeWalls(next);
        current = next;
      } else if (this.stack.length > 0) {
        current = this.stack.pop();
      } else break;
    }
  }

  // ============================================================
  // start: Reinicia o estado do minigame
  // ============================================================
  // Recebe speedMultiplier do GameManager.
  // speedMultiplier aumenta cada vez que o jogador completa todos os minigames.
  // Isso faz o jogador se mover mais rápido (maior dificuldade).
  // ============================================================
  start(speedMultiplier) {
    speedMultiplier = speedMultiplier || 1;

    // Reseta flags de estado
    this.finished = false;
    this.mistakes = 0;
    this.showJumpscare = false;
    this.showWin = false;
    this.winAlpha = 0;
    this.winScale = 0.5;
    this.winTimer = 0;
    this.jumpscareFrame = 0;
    this.score = 0; // Reseta pontuação
    this.startTime = millis(); // Marca tempo de início
    this.waitingForAudio = false; // Reseta flag de áudio
    this.endingSoundPlaying = null; // Reseta referência de som

    // Posiciona jogador no centro da primeira célula
    this.player.x = this.offsetX + this.cellSize / 2;
    this.player.y = this.offsetY + this.cellSize / 2;

    // Velocidade aumenta com dificuldade
    this.speed = 4 * speedMultiplier;

    // Regenera o labirinto para cada tentativa (labirinto diferente!)
    this.generateGrid();
    this.generateMaze();

    // Garante saída na última célula
    let exitCell = this.grid[this.index(this.cols - 1, this.rows - 1)];
    exitCell.walls.bottom = false;

    // Inicia som ambiente em loop
    this.soundAmbient.currentTime = 0;
    this.soundAmbient.volume = 0.4;
    this.soundAmbient.play().catch((e) => {});

    console.log("LabirintGame: Iniciado com speedMultiplier:", speedMultiplier);
  }

  // ============================================================
  // update: Lógica do minigame (chamada a cada frame)
  // ============================================================
  update() {
    // Se já terminou, não atualiza
    if (this.finished) return;

    // --- ANIMAÇÃO DE VITÓRIA ---
    if (this.showWin) {
      this.winTimer++;
      // Fade in e scale suave
      this.winAlpha = min(255, this.winAlpha + 8);
      this.winScale = min(1, this.winScale + 0.02);
      // Termina após 90 frames (1.5 segundos) E áudio terminar
      let animationDone = this.winTimer >= 90;
      let audioDone = this.endingSoundPlaying
        ? this.endingSoundPlaying.ended
        : true;
      if (animationDone && audioDone) this.finished = true;
      return; // Bloqueia todo o resto, incluindo movimento
    }

    // --- ANIMAÇÃO DO JUMPSCARE ---
    if (this.showJumpscare) {
      // Alterna entre os 3 frames do jumpscare
      let now = millis();
      if (now - this.jumpscareLastSwitch > this.jumpscareSwitchInterval) {
        this.jumpscareFrame = (this.jumpscareFrame + 1) % 3;
        this.jumpscareLastSwitch = now;
      }
      this.jumpscareTimer--;
      // Termina após timer E áudio terminar
      let animationDone = this.jumpscareTimer <= 0;
      let audioDone = this.endingSoundPlaying
        ? this.endingSoundPlaying.ended
        : true;
      if (animationDone && audioDone) this.finished = true;
      return; // Bloqueia todo o resto, incluindo movimento
    }

    // --- MOVIMENTO DO JOGADOR ---
    let nx = this.player.x;
    let ny = this.player.y;

    // Lê input das setas do teclado
    if (keyIsDown(LEFT_ARROW)) nx -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) nx += this.speed;
    if (keyIsDown(UP_ARROW)) ny -= this.speed;
    if (keyIsDown(DOWN_ARROW)) ny += this.speed;

    // Calcula em qual célula o jogador está
    let col = floor((nx - this.offsetX) / this.cellSize);
    let row = floor((ny - this.offsetY) / this.cellSize);
    let idx = this.index(col, row);

    if (idx >= 0) {
      let cell = this.grid[idx];

      // Verifica colisão com paredes (usando hitbox circular)
      if (this.collidesWallsCircle(nx, ny, cell)) {
        this.triggerJumpscare();
        return;
      }
    }

    // Atualiza posição do jogador
    this.player.x = nx;
    this.player.y = ny;

    // --- VERIFICA VITÓRIA ---
    // Verifica se o jogador passou sobre o bloco da saída (verde)
    let exitCell = this.grid[this.index(this.cols - 1, this.rows - 1)];
    let exitX = exitCell.x;
    let exitY = exitCell.y + exitCell.size; // Posição do bloco de saída
    let exitSize = exitCell.size;

    // Hitbox circular para vitória também
    let r = this.player.radius;
    if (
      nx + r > exitX &&
      nx - r < exitX + exitSize &&
      ny + r > exitY &&
      ny - r < exitY + exitSize
    ) {
      this.triggerWin();
    }
  }

  // ============================================================
  // collidesWallsCircle: Verifica colisão circular com paredes
  // ============================================================
  // Usa hitbox circular para dar um pouco de "perdão" ao jogador
  // ============================================================
  collidesWallsCircle(px, py, cell) {
    let r = this.player.radius; // Raio do círculo de colisão
    if (cell.walls.top && py - r < cell.y) return true;
    if (cell.walls.right && px + r > cell.x + this.cellSize) return true;
    if (cell.walls.bottom && py + r > cell.y + this.cellSize) return true;
    if (cell.walls.left && px - r < cell.x) return true;
    return false;
  }

  // ============================================================
  // triggerJumpscare: Ativa o jumpscare quando bate na parede
  // ============================================================
  triggerJumpscare() {
    this.showJumpscare = true;
    this.jumpscareTimer = 60; // <-- ALTERE AQUI: Duração do jumpscare (frames, 60 = 1 segundo)
    this.jumpscareFrame = 0;
    this.jumpscareLastSwitch = millis();
    this.mistakes = this.maxMistakes; // Marca como perdido

    // Para som ambiente e toca som do jumpscare
    this.soundAmbient.pause();
    this.soundJumpscare.currentTime = 0;
    this.soundJumpscare.volume = 0.8;
    this.soundJumpscare.play().catch((e) => {});
    this.endingSoundPlaying = this.soundJumpscare; // Guarda referência para esperar terminar

    console.log("LabirintGame: JUMPSCARE! Bateu na parede!");
  }

  // ============================================================
  // triggerWin: Ativa a animação de vitória
  // ============================================================
  triggerWin() {
    this.showWin = true;
    this.winTimer = 0;
    this.winAlpha = 0;
    this.winScale = 0.5;

    // Para som ambiente e toca som de vitória
    this.soundAmbient.pause();
    this.soundWin.currentTime = 0;
    this.soundWin.volume = 0.7;
    this.soundWin.play().catch((e) => {});
    this.endingSoundPlaying = this.soundWin; // Guarda referência para esperar terminar

    // ============================================================
    // CÁLCULO DA PONTUAÇÃO BASEADA NO TEMPO
    // ============================================================
    // Quanto mais rápido completar, mais pontos:
    // < 5s = 100 pontos
    // 5-10s = 80 pontos
    // 10-15s = 60 pontos
    // 15-20s = 40 pontos
    // > 20s = 20 pontos
    // ============================================================
    let elapsedTime = millis() - this.startTime;

    if (elapsedTime < 5000) {
      this.score = 100;
    } else if (elapsedTime < 10000) {
      this.score = 80;
    } else if (elapsedTime < 15000) {
      this.score = 60;
    } else if (elapsedTime < 20000) {
      this.score = 40;
    } else {
      this.score = 20;
    }

    console.log(
      "LabirintGame: VITÓRIA! Score:",
      this.score,
      "(tempo:",
      Math.round(elapsedTime) + "ms)"
    );
  }

  // ============================================================
  // draw: Desenha o minigame na tela
  // ============================================================
  draw() {
    // Fundo com cor do tema (#313131)
    background(49, 49, 49);
    noStroke();

    // Desenha as paredes do labirinto
    for (let c of this.grid) c.show();

    // --- DESENHA O JOGADOR ---
    if (this.playerImg && !this.showJumpscare && !this.showWin) {
      imageMode(CENTER);
      image(
        this.playerImg,
        this.player.x,
        this.player.y,
        this.player.size,
        this.player.size
      );
    } else if (!this.showJumpscare && !this.showWin) {
      // Fallback: círculo branco se imagem não carregou
      fill(255);
      ellipse(this.player.x, this.player.y, this.player.radius * 2);
    }

    // --- DESENHA A SAÍDA (bloco verde) ---
    // O bloco de saída fica abaixo da última célula do labirinto
    let exitCell = this.grid[this.index(this.cols - 1, this.rows - 1)];
    fill(100, 200, 100); // Verde suave
    rect(exitCell.x, exitCell.y + exitCell.size, exitCell.size, exitCell.size);

    // --- TELA DE JUMPSCARE ---
    if (this.showJumpscare) {
      // Fundo preto para destacar o jumpscare
      background(0);

      // Imagem do jumpscare (alterna entre as 3)
      if (this.jumpscareImgs[this.jumpscareFrame]) {
        imageMode(CENTER);
        let imgSize = min(width, height) * 0.8;
        image(
          this.jumpscareImgs[this.jumpscareFrame],
          width / 2,
          height / 2,
          imgSize,
          imgSize
        );
      } else {
        // Fallback: texto vermelho se imagem não carregou
        fill(255, 0, 0);
        textSize(80);
        textAlign(CENTER, CENTER);
        text("PERDEU!", width / 2, height / 2);
      }
    }

    // --- TELA DE VITÓRIA (com fade in e scale suave) ---
    if (this.showWin) {
      // Fundo do tema
      background(49, 49, 49);

      if (this.winImg) {
        imageMode(CENTER);
        tint(255, this.winAlpha); // Fade in
        let imgW = this.winImg.width * this.winScale;
        let imgH = this.winImg.height * this.winScale;
        // Limita tamanho máximo
        let maxSize = min(width, height) * 0.7;
        if (imgW > maxSize) {
          let ratio = maxSize / imgW;
          imgW *= ratio;
          imgH *= ratio;
        }
        image(this.winImg, width / 2, height / 2, imgW, imgH);
        noTint(); // Reseta tint para não afetar outros desenhos
      } else {
        // Fallback: texto verde se imagem não carregou
        fill(100, 255, 100, this.winAlpha);
        textSize(60);
        textAlign(CENTER, CENTER);
        text("VITORIA!", width / 2, height / 2);
      }
    }
  }
}

// ============================================================
// MazeCell — Classe que representa uma célula do labirinto
// ============================================================
// Cada célula tem 4 paredes (top, right, bottom, left).
// Durante a geração do labirinto, paredes são removidas
// para criar o caminho.
// ============================================================

class MazeCell {
  constructor(c, r, size, ox, oy) {
    this.c = c; // Coluna da célula
    this.r = r; // Linha da célula
    this.x = ox + c * size; // Posição X na tela
    this.y = oy + r * size; // Posição Y na tela
    this.size = size; // Tamanho da célula
    this.visited = false; // Se já foi visitada (para geração do labirinto)
    this.walls = { top: true, right: true, bottom: true, left: true }; // Paredes ativas
  }

  // ============================================================
  // checkNeighbors: Retorna um vizinho não visitado aleatório
  // ============================================================
  checkNeighbors(grid, cols, rows, indexFn) {
    let neighbors = [];
    let top = grid[indexFn(this.c, this.r - 1)];
    let right = grid[indexFn(this.c + 1, this.r)];
    let bottom = grid[indexFn(this.c, this.r + 1)];
    let left = grid[indexFn(this.c - 1, this.r)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    return neighbors.length > 0
      ? neighbors[floor(random(neighbors.length))]
      : undefined;
  }

  // ============================================================
  // removeWalls: Remove as paredes entre duas células adjacentes
  // ============================================================
  removeWalls(other) {
    let dx = this.c - other.c;
    let dy = this.r - other.r;

    if (dx === 1) {
      this.walls.left = false;
      other.walls.right = false;
    } else if (dx === -1) {
      this.walls.right = false;
      other.walls.left = false;
    }

    if (dy === 1) {
      this.walls.top = false;
      other.walls.bottom = false;
    } else if (dy === -1) {
      this.walls.bottom = false;
      other.walls.top = false;
    }
  }

  // ============================================================
  // show: Desenha as paredes da célula
  // ============================================================
  show() {
    push();
    // Cor das paredes (rosa/roxo claro para combinar com o tema)
    stroke(180, 130, 160);
    strokeWeight(4);
    noFill();
    if (this.walls.top) line(this.x, this.y, this.x + this.size, this.y);
    if (this.walls.right)
      line(this.x + this.size, this.y, this.x + this.size, this.y + this.size);
    if (this.walls.bottom)
      line(this.x, this.y + this.size, this.x + this.size, this.y + this.size);
    if (this.walls.left) line(this.x, this.y, this.x, this.y + this.size);
    pop();
  }
}

// ============================================================
// cleanup: Para todos os sons do minigame
// ============================================================
// Chamado pelo GameManager antes de iniciar o próximo minigame
// para evitar que sons continuem tocando em background.
// ============================================================
LabirintGame.prototype.cleanup = function () {
  this.soundAmbient.pause();
  this.soundJumpscare.pause();
  this.soundWin.pause();
};
