# 🎮 Plugies Dreamy Chaos

Um jogo de minigames desenvolvido com **p5.js** onde você controla o Plugie através de desafios variados! Inclui setas rítmicas, quick-time events com um goblin e labirinto com jumpscare!

---

## 📋 Índice

1. [Estrutura do Projeto](#-estrutura-do-projeto)
2. [Como Executar](#-como-executar)
3. [Sistema de Utilizadores](#-sistema-de-utilizadores)
4. [Sistema de Highscores](#-sistema-de-highscores)
5. [Os 3 Minigames](#-os-3-minigames)
6. [Sistema de Som](#-sistema-de-som)
7. [Sistema de Pontuação](#-sistema-de-pontuação)
8. [Sistema de Vidas](#️-sistema-de-vidas)
9. [Dificuldade Progressiva](#-dificuldade-progressiva)
10. [Arquitetura do Código](#-arquitetura-do-código)
11. [Descrição Detalhada dos Arquivos](#-descrição-detalhada-dos-arquivos)
12. [Assets](#️-assets)
13. [Controles](#-controles)
14. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
15. [Funções e Métodos](#-funções-e-métodos)
16. [Fluxo do Jogo](#-fluxo-do-jogo)
17. [Como Adicionar Novos Minigames](#-como-adicionar-novos-minigames)
18. [Variáveis Configuráveis](#️-variáveis-configuráveis)
19. [Créditos](#-créditos)

---

## 📁 Estrutura do Projeto

```
ProjetoProg/
├── Index.html          # Página principal com login, menu e container do jogo
├── styles.css          # Estilos do login, menu, modais e layout geral
├── script.js           # Lógica do menu, música e modais
├── userSystem.js       # Sistema de utilizadores e highscores (localStorage)
├── sketch.js           # Setup do p5.js, HUD de vidas e Plugie dancer
├── gameManager.js      # Gerenciador de minigames, vidas e dificuldade
├── GameOver.js         # Tela de Game Over com animação e novo recorde
├── Minigames/
│   ├── Arrows.js       # Minigame 1: Setas rítmicas
│   ├── Goblin.js       # Minigame 2: Quick-time event do Goblin
│   └── Labirint.js     # Minigame 3: Labirinto com jumpscare
├── IMGS/               # Imagens estáticas (setas, Plugie, UI, jumpscares)
├── GIFS/               # GIFs animados (Plugie idle, vidas)
├── SFX/                # Efeitos sonoros e músicas
└── Fonts/              # Fontes customizadas
```

---

## 🚀 Como Executar

1. Abra o arquivo `Index.html` em um navegador moderno (Chrome, Firefox, Edge)
2. **Crie um perfil** digitando seu nome ou **selecione um perfil existente**
3. No menu, clique no botão **"Play"** para iniciar o jogo
4. Complete os 3 minigames em sequência
5. Pressione **R** a qualquer momento para reiniciar

**Requisitos:**

- Navegador com suporte a JavaScript ES6
- Conexão com internet (para carregar p5.js via CDN)
- Áudio habilitado para a experiência completa

---

## 👤 Sistema de Utilizadores

O jogo possui um sistema de perfis/contas que permite múltiplos jogadores no mesmo dispositivo.

### Tela de Login

Ao abrir o jogo, você verá uma tela preta com:

- **Campo de texto** para digitar seu nome
- **Lista de perfis existentes** com seus highscores

### Funcionalidades

| Ação              | Como fazer                                 |
| ----------------- | ------------------------------------------ |
| Criar perfil      | Digite um nome e clique em "Entrar"        |
| Selecionar perfil | Clique em um nome na lista                 |
| Apagar perfil     | Passe o mouse sobre o perfil e clique no ✕ |

### Implementação Técnica

```javascript
// Estrutura de um utilizador no localStorage
{
  name: "NomeDoJogador",
  highscore: 1500,
  createdAt: 1704672000000  // timestamp
}

// Chave do localStorage
const USERS_STORAGE_KEY = "plugies_users";
```

### Funções Principais (userSystem.js)

| Função                   | Descrição                                   |
| ------------------------ | ------------------------------------------- |
| `getAllUsers()`          | Retorna array com todos os utilizadores     |
| `createUser(name)`       | Cria novo utilizador ou seleciona existente |
| `selectUser(name)`       | Seleciona um utilizador pelo nome           |
| `deleteUser(name)`       | Remove um utilizador da lista               |
| `getCurrentUser()`       | Retorna o utilizador atualmente logado      |
| `updateHighscore(score)` | Atualiza o highscore se for maior           |
| `getHighscoreRanking()`  | Retorna utilizadores ordenados por score    |

---

## 🏆 Sistema de Highscores

Cada utilizador tem seu próprio **highscore** que é salvo automaticamente.

### Como Funciona

1. Ao final de cada partida (Game Over), o score é comparado com o highscore do utilizador
2. Se o score for **maior**, o highscore é atualizado
3. Uma mensagem **"★ NOVO RECORDE! ★"** aparece na tela de Game Over

### Ranking/Scoreboard

No menu principal, clique no botão **"Scores"** para ver o ranking:

- 🥇 Top 1 em dourado
- 🥈 Top 2 em prata
- 🥉 Top 3 em bronze
- O utilizador atual é destacado com borda dourada

### Persistência

Os dados são salvos no **localStorage** do navegador:

- Não se perdem ao fechar o navegador
- Cada navegador/dispositivo tem seus próprios dados
- Para limpar todos os dados: `localStorage.clear()` no console

---

## 🎯 Os 3 Minigames

### 1️⃣ ArrowGame (Setas Rítmicas)

**Descrição:** Estilo Guitar Hero/DDR — setas vêm de ambos os lados e você deve pressionar a tecla correta quando estiverem no centro.

**Mecânica:**

- Setas aparecem nas laterais e se movem em direção ao centro
- Pressione a tecla correspondente (←, →, ↑, ↓) quando estiverem no overlay central
- **AMBAS** as setas do par devem estar dentro do hitbox para contar como acerto
- O Plugie dança conforme você acerta!

**Condições:**

- ✅ **Vitória:** 3 acertos
- ❌ **Derrota:** 3 erros (setas passam sem pressionar OU tecla errada)

**Pontuação:** Baseada na precisão — quanto mais perto do centro, mais pontos

---

### 2️⃣ GoblinGame (Quick-Time Event)

**Descrição:** Um goblin corre em sua direção! Pressione as 3 teclas indicadas antes que ele te alcance.

**Mecânica:**

1. **Fase de espera (2-5 segundos):** Olhos aparecem no fundo escuro
2. **Fase de ação:** Goblin corre (7 frames de animação)
3. Pressione as **3 teclas aleatórias** mostradas na tela (A-Z, 0-9)
4. Acerto = soco no goblin! | Erro = goblin te pega!

**Condições:**

- ✅ **Vitória:** Pressionar todas as 3 teclas corretas a tempo
- ❌ **Derrota:** Tempo acabar OU pressionar tecla errada 3x

**Pontuação:**

```javascript
// Base: 100 pontos
// Bônus por tempo:
//   <2 segundos = +30 pontos
//   2-4 segundos = +15 pontos
//   4-6 segundos = 0 pontos
//   >6 segundos = -20 pontos
// Penalidade: cada tecla errada = -15 pontos
score = max(0, baseScore + timeBonus - errorPenalty);
```

---

### 3️⃣ LabirintGame (Labirinto)

**Descrição:** Navegue pelo labirinto gerado aleatoriamente até a saída verde. Cuidado com as paredes!

**Mecânica:**

- Use as setas (←, →, ↑, ↓) para mover o círculo rosa (jogador)
- Chegue ao **quadrado verde** (saída) para vencer
- **NÃO TOQUE NAS PAREDES!** → Jumpscare + derrota

**Geração do Labirinto:**

- Algoritmo: **Recursive Backtracking**
- Tamanho: 5 colunas × 6 linhas
- Entrada: Canto superior esquerdo
- Saída: Canto inferior direito

**Condições:**

- ✅ **Vitória:** Chegar na saída verde
- ❌ **Derrota:** Tocar em qualquer parede

**Pontuação:** Baseada no tempo:
| Tempo | Pontos |
|-------|--------|
| < 5s | 100 |
| < 10s | 80 |
| < 15s | 60 |
| < 20s | 40 |
| > 20s | 20 |

---

## 🎵 Sistema de Som

### Implementação Técnica

Todos os sons usam a **Web Audio API** nativa do JavaScript (`new Audio()`).

```javascript
// Exemplo de criação de som
this.bgMusic = new Audio("SFX/ArrowsBackMusic.mp3");
this.bgMusic.loop = true; // Som em loop
this.bgMusic.volume = 0.3; // Volume de 0.0 a 1.0
this.bgMusic.play(); // Toca o som
```

### Função `cleanup()`

Cada minigame implementa uma função `cleanup()` que:

1. Para todos os sons ativos (`pause()`)
2. Reseta o tempo para o início (`currentTime = 0`)
3. É chamada automaticamente pelo GameManager ao trocar de minigame

```javascript
// Exemplo de cleanup
cleanup() {
  this.bgMusic.pause();
  this.bgMusic.currentTime = 0;
  this.soundWrong.pause();
  this.soundWrong.currentTime = 0;
}
```

### Sons por Contexto

#### 🏠 Menu

| Som             | Arquivo              | Comportamento                          |
| --------------- | -------------------- | -------------------------------------- |
| Música de fundo | `MenuMusic1/2/3.mp3` | Alterna aleatoriamente entre 3 músicas |

**Sistema de alternância:**

```javascript
// Quando uma música termina, outra aleatória começa
menuMusic.addEventListener("ended", () => {
  menuMusic.src = getRandomMenuMusic();
  menuMusic.play();
});
```

#### ⬅️ ArrowGame

| Som             | Arquivo               | Quando toca                                |
| --------------- | --------------------- | ------------------------------------------ |
| Música de fundo | `ArrowsBackMusic.mp3` | Loop durante todo o minigame               |
| Acerto esquerda | `Arrows_Left.mp3`     | Ao acertar seta ←                          |
| Acerto direita  | `Arrows_Right.mp3`    | Ao acertar seta →                          |
| Acerto cima     | `Arrows_Up.mp3`       | Ao acertar seta ↑                          |
| Acerto baixo    | `Arrows_Down.mp3`     | Ao acertar seta ↓                          |
| Erro            | `Arrows_Wrong.mp3`    | Ao errar (espera terminar antes de trocar) |

#### 👹 GoblinGame

| Som     | Arquivo               | Quando toca                |
| ------- | --------------------- | -------------------------- |
| Espera  | `Goblin_Waiting.mp3`  | Loop durante fase de olhos |
| Passos  | `Goblin_Footstep.mp3` | Goblin correndo            |
| Soco    | `Goblin_Punch.mp3`    | Ao vencer (acertar teclas) |
| Rosnado | `Goblin_Growl.mp3`    | Ao perder (goblin te pega) |

#### 🧩 LabirintGame

| Som       | Arquivo              | Quando toca            |
| --------- | -------------------- | ---------------------- |
| Ambiente  | `MazeAmbient.mp3`    | Loop durante navegação |
| Jumpscare | `Maze_Jumpscare.mp3` | Ao tocar na parede     |
| Vitória   | `Maze_Win.mp3`       | Ao chegar na saída     |

#### 💀 Game Over

| Som           | Arquivo        | Quando toca                               |
| ------------- | -------------- | ----------------------------------------- |
| Música triste | `GameOver.mp3` | Toca automaticamente na tela de game over |

---

## 🏆 Sistema de Pontuação

### Acumulação

A pontuação é **acumulada** a cada minigame vencido. A pontuação total é armazenada em `manager.totalScore`.

```javascript
// GameManager.update() - quando minigame é vencido
if (typeof current.score === "number") {
  this.totalScore += current.score;
}
```

### Pontuação por Minigame

| Minigame     | Cálculo                                    |
| ------------ | ------------------------------------------ |
| ArrowGame    | Precisão dos acertos (distância do centro) |
| GoblinGame   | 100 base + bônus tempo - penalidade erros  |
| LabirintGame | Baseado no tempo (100/80/60/40/20)         |

### Exibição Final

A pontuação final é exibida na tela de Game Over:

```javascript
text("Score: " + this.score, width / 2, scoreY);
```

---

## ❤️ Sistema de Vidas

### Configuração

```javascript
// gameManager.js
this.lives = 4; // Vidas atuais
this.maxLives = 4; // Vidas máximas
```

### Mecânica

1. Jogador começa com **4 vidas**
2. Perder um minigame = perder **1 vida**
3. Vidas = 0 → **Game Over**
4. Vidas são restauradas ao reiniciar (`R`)

### HUD de Vidas (HTML)

As vidas são exibidas como **GIFs animados** no canto superior direito da tela.

```javascript
// Cria 4 elementos <img> com o GIF de vida
function createLivesHUD() {
  livesDiv = createDiv("");
  livesDiv.id("livesHUD");
  for (let i = 0; i < manager.maxLives; i++) {
    let img = createImg("GIFS/Vida.gif", "vida");
    img.parent(livesDiv);
  }
}
```

**Atualização visual:**

```javascript
// Troca GIF animado por imagem estática quando perde vida
function updateLivesHUD(currentLives) {
  const imgs = document.querySelectorAll("#livesHUD img");
  imgs.forEach((img, i) => {
    if (i < currentLives) {
      img.src = "GIFS/Vida.gif"; // Vida ativa (animada)
    } else {
      img.src = "IMGS/vidamorta.png"; // Vida perdida (estática)
    }
  });
}
```

---

## 📈 Dificuldade Progressiva

### Sistema de Multiplicador

A cada **rodada completa** (todos os 3 minigames jogados), a dificuldade aumenta:

```javascript
// gameManager.js - após completar todos os minigames
if (this.current >= this.minigames.length) {
  this.current = 0;
  this.speedMultiplier *= 1.2; // +20% de velocidade
}
```

### Tabela de Progressão

| Rodada | Multiplicador | Efeito           |
| ------ | ------------- | ---------------- |
| 1      | 1.0x          | Normal           |
| 2      | 1.2x          | 20% mais rápido  |
| 3      | 1.44x         | 44% mais rápido  |
| 4      | 1.73x         | 73% mais rápido  |
| 5      | 2.07x         | 107% mais rápido |

### Impacto nos Minigames

**ArrowGame:**

```javascript
this.currentSpeed = this.BASE_SPEED * speedMultiplier; // Setas mais rápidas
this.currentSpawnInterval = this.BASE_SPAWN_INTERVAL / speedMultiplier; // Spawn mais frequente
```

**GoblinGame:**

```javascript
this.timePerFrame = this.BASE_TIME_PER_FRAME / speedMultiplier; // Animação mais rápida
```

**LabirintGame:**

```javascript
this.speed = 4 * speedMultiplier; // Movimento mais rápido
```

---

## 🏗️ Arquitetura do Código

### Padrão de Design

O projeto utiliza uma arquitetura **baseada em classes** com um **gerenciador central**:

```
┌─────────────────────────────────────────────────────────┐
│                     Index.html                          │
│  (Carrega todos os scripts na ordem correta)            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      script.js                          │
│  (Menu + Música de fundo + Botão Play)                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      sketch.js                          │
│  (p5.js: preload, setup, draw, keyPressed)              │
│  (HUD de vidas, Plugie dancer)                          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    GameManager                          │
│  - Lista de minigames                                   │
│  - Controle de vidas                                    │
│  - Multiplicador de dificuldade                         │
│  - Pontuação total                                      │
└─────────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  ArrowGame  │  │ GoblinGame  │  │LabirintGame │
│  (Setas)    │  │ (Quick-time)│  │ (Labirinto) │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Interface dos Minigames

Cada minigame deve implementar:

| Método/Propriedade       | Tipo    | Descrição                            |
| ------------------------ | ------- | ------------------------------------ |
| `start(speedMultiplier)` | método  | Inicia/reinicia o minigame           |
| `update()`               | método  | Atualiza lógica a cada frame         |
| `draw()`                 | método  | Desenha na tela                      |
| `cleanup()`              | método  | Para todos os sons                   |
| `keyPressed()`           | método  | Processa input (opcional)            |
| `onResize(w, h)`         | método  | Adapta ao tamanho da tela (opcional) |
| `finished`               | boolean | Se o minigame terminou               |
| `mistakes`               | number  | Erros cometidos                      |
| `maxMistakes`            | number  | Máximo de erros permitidos           |
| `score`                  | number  | Pontuação obtida                     |

---

## 📂 Descrição Detalhada dos Arquivos

### 🌐 Index.html

**Função:** Página principal que estrutura o login, menu e carrega os scripts.

**Estrutura HTML:**

```html
<!-- Tela de Login (exibida primeiro) -->
<div id="loginScreen">
  <div id="loginContainer">
    <h1 id="loginTitle">           <!-- Título do jogo -->
    <input id="usernameInput">     <!-- Campo para nome -->
    <button id="createUserBtn">    <!-- Botão Entrar -->
    <div id="userList">            <!-- Lista de perfis existentes -->
  </div>
</div>

<!-- Menu Principal (display:none inicialmente) -->
<main id="menu">
  <img id="logoTitle">           <!-- Logo do jogo -->
  <div id="rightSide">
    <div id="VidaMenuGif">       <!-- 4 GIFs de vida decorativos -->
    <div id="PlugieMenuGif">     <!-- Plugie animado -->
  </div>
  <div id="menuButtons">
    <img id="playButton">        <!-- Botão Play -->
    <img id="creditsButton">     <!-- Botão Créditos -->
    <img id="scoresButton">      <!-- Botão Scores/Ranking -->
  </div>
  <div id="scoresModal">         <!-- Modal de Ranking -->
  <div id="settingsModal">       <!-- Modal de Configurações -->
  <div id="creditsModal">        <!-- Modal de Créditos -->
</main>

<div id="gameContainer">         <!-- Canvas do p5.js (display:none) -->
```

**Ordem de carregamento dos scripts:**

1. `userSystem.js` — Sistema de utilizadores
2. `script.js` — Menu e música
3. `p5.js` (CDN) — Biblioteca gráfica
4. `GameOver.js` — Tela de fim
5. `gameManager.js` — Gerenciador
6. `Arrows.js` — Minigame 1
7. `Goblin.js` — Minigame 2
8. `Labirint.js` — Minigame 3
9. `sketch.js` — Setup do p5.js

---

### 🎨 styles.css

**Função:** Estilização visual do login, menu, modais e layout geral.

**Seções principais:**

| Seção             | Descrição                                   |
| ----------------- | ------------------------------------------- |
| Tela de Login     | Fundo preto, input dourado, lista de perfis |
| Menu Principal    | Fundo com imagem, botões com hover          |
| Modal de Scores   | Ranking com medalhas (🥇🥈🥉)               |
| Modal de Settings | Sliders de volume                           |
| Modal de Créditos | Informações dos desenvolvedores             |

**Configurações principais:**

```css
/* Tela de Login */
#loginScreen {
  position: fixed;
  background: #0a0a0a;
  z-index: 2000;
}

#loginContainer {
  background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
  border: 3px solid #3d3d3d;
  border-radius: 20px;
}

/* Lista de utilizadores com efeito neon no hover */
.user-item:hover {
  border-color: #f0c040;
  box-shadow: 0 0 15px rgba(240, 192, 64, 0.4);
}

/* Ranking com medalhas */
.score-entry:nth-child(1) .score-rank {
  color: #ffd700;
} /* Ouro */
.score-entry:nth-child(2) .score-rank {
  color: #c0c0c0;
} /* Prata */
.score-entry:nth-child(3) .score-rank {
  color: #cd7f32;
} /* Bronze */
```

---

### 🖱️ script.js

**Função:** Lógica do menu inicial e sistema de música de fundo.

**Responsabilidades:**

1. Gerenciar 3 músicas do menu que alternam aleatoriamente
2. Controlar fade in/out da música
3. Esconder menu e mostrar canvas ao clicar em Play
4. Iniciar o jogo chamando `startGame()`

**Sistema de Música:**

```javascript
// Array com as 3 músicas
const menuMusicFiles = [
  "SFX/MenuMusic1.mp3",
  "SFX/MenuMusic2.mp3",
  "SFX/MenuMusic3.mp3",
];

// Escolhe música aleatória
function getRandomMenuMusic() {
  const randomIndex = Math.floor(Math.random() * menuMusicFiles.length);
  return menuMusicFiles[randomIndex];
}

// Quando uma música termina, toca outra
menuMusic.addEventListener("ended", () => {
  menuMusic.src = getRandomMenuMusic();
  menuMusic.play();
});
```

**Fade In/Out:**

```javascript
function fadeInMusic() {
  let vol = 0;
  const fadeInterval = setInterval(() => {
    vol += 0.02;
    if (vol >= 0.4) clearInterval(fadeInterval);
    menuMusic.volume = vol;
  }, 50);
}

function fadeOutMenuMusic() {
  let vol = menuMusic.volume;
  const fadeInterval = setInterval(() => {
    vol -= 0.02;
    if (vol <= 0) {
      menuMusic.pause();
      clearInterval(fadeInterval);
    }
    menuMusic.volume = vol;
  }, 30);
}
```

---

### 👤 userSystem.js

**Função:** Sistema de gerenciamento de utilizadores e highscores.

**Responsabilidades:**

1. Criar, selecionar e apagar perfis de utilizadores
2. Armazenar dados no localStorage
3. Gerenciar highscores individuais
4. Renderizar lista de utilizadores na tela de login
5. Controlar transição login → menu

**Estrutura de Dados:**

```javascript
// Utilizador armazenado no localStorage
{
  name: "NomeDoJogador",
  highscore: 1500,
  createdAt: 1704672000000
}

// Array de utilizadores
const USERS_STORAGE_KEY = "plugies_users";
// localStorage["plugies_users"] = JSON.stringify([user1, user2, ...])
```

**Funções de Gerenciamento:**

```javascript
// Retorna todos os utilizadores
function getAllUsers() {
  const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJSON ? JSON.parse(usersJSON) : [];
}

// Cria ou seleciona utilizador
function createUser(name) {
  const cleanName = name.trim();
  const users = getAllUsers();
  const existingUser = users.find(
    (u) => u.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (existingUser) {
    currentUser = existingUser; // Seleciona existente
  } else {
    const newUser = { name: cleanName, highscore: 0, createdAt: Date.now() };
    users.push(newUser);
    saveAllUsers(users);
    currentUser = newUser;
  }
  return currentUser;
}

// Atualiza highscore se for maior
function updateHighscore(score) {
  if (score > currentUser.highscore) {
    currentUser.highscore = score;
    // Atualiza no localStorage...
    return true; // Novo recorde!
  }
  return false;
}
```

**Renderização da Lista:**

```javascript
function renderUserList() {
  const users = getAllUsers();
  users.sort((a, b) => b.highscore - a.highscore); // Ordena por highscore

  users.forEach((user) => {
    // Cria elementos HTML para cada utilizador
    // Adiciona evento de clique para selecionar
    // Adiciona botão de apagar
  });
}
```

---

### 🎮 sketch.js

**Função:** Arquivo principal do p5.js — setup, loop principal e HUD.

**Responsabilidades:**

1. `preload()` — Carrega todas as imagens antes do jogo
2. `setup()` — Cria canvas, HUD e instâncias dos minigames
3. `draw()` — Loop principal (60fps)
4. `keyPressed()` — Detecta input e cheat codes
5. HUD de vidas (GIFs via HTML)
6. Plugie dancer (personagem animado)

**Sistema de Cheat Codes:**

```javascript
let cheatBuffer = "";
const CHEAT_GAMEOVER = "gameover";

function keyPressed() {
  cheatBuffer += key.toLowerCase();
  if (cheatBuffer.length > CHEAT_GAMEOVER.length) {
    cheatBuffer = cheatBuffer.slice(-CHEAT_GAMEOVER.length);
  }
  if (cheatBuffer === CHEAT_GAMEOVER) {
    // Ativa Game Over instantaneamente
    manager.gameOver = new GameOver(4, 0, 0, 500);
  }
}
```

**Plugie Dancer:**

```javascript
// Anima o Plugie quando acerta uma seta
function animatePlugie(direction) {
  // direction: "left", "right", "up", "down"
  plugieImg.src = `IMGS/plugie_danca_${direction}.png`;
  // Volta ao idle após 300ms
  setTimeout(resetPlugieToIdle, 300);
}

function resetPlugieToIdle() {
  plugieImg.src = "GIFS/plug_anim3.gif";
}
```

---

### 🎯 gameManager.js

**Função:** Gerenciador central que controla o fluxo do jogo.

**Propriedades:**

```javascript
this.minigames = []; // Lista de minigames
this.current = 0; // Índice atual
this.speedMultiplier = 1; // Multiplicador de velocidade
this.lives = 4; // Vidas atuais
this.maxLives = 4; // Vidas máximas
this.totalScore = 0; // Pontuação acumulada
this.perfectCompleted = 0; // Minigames sem erros
this.gameOver = null; // Instância do Game Over
```

**Fluxo do `update()`:**

```
┌──────────────────────────────────────┐
│         Minigame atual               │
│         current.update()             │
└──────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │  finished?   │
         └──────────────┘
           │         │
          Sim       Não
           │         │
           ▼         └─► Continua jogando
    ┌──────────────┐
    │mistakes >=   │
    │maxMistakes?  │
    └──────────────┘
      │         │
     Sim       Não
      │         │
      ▼         ▼
   Perde      Vence
   1 vida     +Score
      │         │
      ▼         ▼
┌──────────┐ ┌──────────┐
│lives=0?  │ │Próximo   │
└──────────┘ │minigame  │
  │    │     └──────────┘
 Sim  Não
  │    │
  ▼    └─► Próximo minigame
Game Over
```

---

### ⬅️➡️ Minigames/Arrows.js

**Função:** Minigame de setas rítmicas estilo Guitar Hero.

**Estrutura de dados das setas:**

```javascript
this.pairs = [
  {
    leftX: -120, // Posição X da seta esquerda
    rightX: 800, // Posição X da seta direita
    y: 500, // Posição Y (altura do bloco)
    dir: "left", // Direção atual (left, right, up, down)
    hit: false, // Se já foi acertada
    missed: false, // Se passou sem acertar
  },
  // ... mais pares
];
```

**Lógica de movimento:**

```javascript
// Setas se movem em direção ao centro
pair.leftX += this.currentSpeed; // Esquerda → Centro
pair.rightX -= this.currentSpeed; // Direita ← Centro
```

**Detecção de acerto:**

```javascript
// Verifica se AMBAS as setas estão no hitbox
const leftInHitbox = Math.abs(pair.leftX - hitZone.x) < hitZone.size / 2;
const rightInHitbox = Math.abs(pair.rightX - hitZone.x) < hitZone.size / 2;

if (leftInHitbox && rightInHitbox && keyCode === correctKey) {
  // ACERTO!
  pair.hit = true;
  this.hits++;
  animatePlugie(pair.dir);
}
```

---

### 👹 Minigames/Goblin.js

**Função:** Minigame de quick-time event com goblin.

**Máquina de estados:**

```javascript
this.state = "waiting"; // Estados: waiting, running, success_anim, fail_anim, success, fail

// Transições:
// waiting → running (após 2-5 segundos aleatórios)
// running → success_anim (acertou todas as teclas)
// running → fail_anim (errou ou tempo acabou)
// success_anim → success (animação terminou)
// fail_anim → fail (animação terminou)
```

**Sistema de teclas:**

```javascript
// Gera 3 teclas aleatórias sem repetição
generateRandomKeys() {
  const allKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  const keys = [];
  while (keys.length < 3) {
    const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
    if (!keys.includes(randomKey)) {
      keys.push(randomKey);
    }
  }
  return keys;
}
```

**Animação do goblin:**

```javascript
// 7 frames: frame_final-6.png → frame_final.png
// Frame 6 = mais longe, Frame 0 = mais perto
this.currentFrame = 6;  // Começa longe

update() {
  if (millis() - this.lastFrameTime > this.timePerFrame) {
    this.currentFrame--;  // Próximo frame (mais perto)
    if (this.currentFrame < 0) {
      // Goblin chegou! Jogador perdeu
      this.triggerFail();
    }
  }
}
```

---

### 🧩 Minigames/Labirint.js

**Função:** Minigame de labirinto com geração procedural e colisão.

**Classe MazeCell:**

```javascript
class MazeCell {
  constructor(c, r, cellSize, offsetX, offsetY) {
    this.c = c; // Coluna no grid
    this.r = r; // Linha no grid
    this.x = c * cellSize + offsetX; // Posição X em pixels
    this.y = r * cellSize + offsetY; // Posição Y em pixels
    this.walls = [true, true, true, true]; // [top, right, bottom, left]
    this.visited = false; // Para geração do labirinto
  }
}
```

**Algoritmo Recursive Backtracking:**

```javascript
generateMaze() {
  const stack = [];
  let current = this.grid[0];  // Começa na célula (0,0)
  current.visited = true;

  while (true) {
    // Encontra vizinho não visitado
    const next = current.checkNeighbors(this.grid, this.cols, this.rows, this.index.bind(this));

    if (next) {
      next.visited = true;
      stack.push(current);
      current.removeWalls(next);  // Remove parede entre elas
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();      // Backtrack
    } else {
      break;  // Todas as células visitadas
    }
  }
}
```

**Sistema de colisão circular:**

```javascript
collidesWallsCircle(px, py, cell) {
  const radius = this.playerRadius;

  // Verifica cada parede
  if (cell.walls[0]) { // Parede superior
    if (py - radius < cell.y) return true;
  }
  if (cell.walls[1]) { // Parede direita
    if (px + radius > cell.x + this.cellSize) return true;
  }
  if (cell.walls[2]) { // Parede inferior
    if (py + radius > cell.y + this.cellSize) return true;
  }
  if (cell.walls[3]) { // Parede esquerda
    if (px - radius < cell.x) return true;
  }
  return false;
}
```

---

### 💀 GameOver.js

**Função:** Tela de fim de jogo com animação, estatísticas e atualização de highscore.

**Parâmetros do construtor:**

```javascript
constructor(totalMistakes, score, elapsedMs, minigamesCompleted) {
  this.totalMistakes = totalMistakes;       // Total de vidas perdidas
  this.score = score;                        // Pontuação final
  this.elapsedMs = elapsedMs;               // Tempo total jogado
  this.minigamesCompleted = minigamesCompleted; // Minigames sem erros

  // Atualiza highscore do utilizador
  this.isNewHighscore = false;
  if (typeof updateHighscore === "function") {
    this.isNewHighscore = updateHighscore(this.score);
  }
}
```

**Exibição de Novo Recorde:**

```javascript
draw() {
  // ... desenha pontuação ...

  // Mostra "NOVO RECORDE!" se bateu o highscore
  if (this.isNewHighscore) {
    fill(240, 192, 64); // Dourado
    textSize(28);
    text("★ NOVO RECORDE! ★", width / 2, scoreY + 40);
  }

  // Mostra nome do utilizador
  const user = getCurrentUser();
  if (user) {
    text("Jogador: " + user.name, width / 2, userY);
  }
}
```

**Animação:**

```javascript
// Alterna entre 2 frames a cada 400ms
draw() {
  const now = millis();
  if (now - this.lastFrameSwitch > this.frameSwitchInterval) {
    this.currentFrame = (this.currentFrame + 1) % 2;
    this.lastFrameSwitch = now;
  }

  const currentImg = this.currentFrame === 0
    ? this.gameoverImg1
    : this.gameoverImg2;

  image(currentImg, charX, charY, charWidth, charHeight);
}
```

---

## 🖼️ Assets

### IMGS/ (Imagens Estáticas)

| Arquivo                  | Descrição                         | Usado em     |
| ------------------------ | --------------------------------- | ------------ |
| `logo.png`               | Logo do jogo                      | Menu         |
| `PLAY.png`               | Botão Play                        | Menu         |
| `CRETIDOS.png`           | Botão Créditos                    | Menu         |
| `PrimeirosDarwins11.png` | Fundo do menu                     | Menu         |
| `New_Drawing_1.png`      | Fundo do ArrowGame                | ArrowGame    |
| `setinhaesquerda.png`    | Seta esquerda                     | ArrowGame    |
| `setinhadireita.png`     | Seta direita                      | ArrowGame    |
| `setinhacima.png`        | Seta cima                         | ArrowGame    |
| `setinhabaixo.png`       | Seta baixo                        | ArrowGame    |
| `caixinhaui.png`         | Overlay/hitbox                    | ArrowGame    |
| `plugie_danca_*.png`     | Plugie dançando (8 imagens)       | ArrowGame    |
| `frame_final*.png`       | Frames do Goblin (7 imagens)      | GoblinGame   |
| `final_bom*.png`         | Animação vitória goblin           | GoblinGame   |
| `finalmau*.png`          | Animação derrota goblin           | GoblinGame   |
| `Jumpscare*.png`         | Imagens do jumpscare (3 imagens)  | LabirintGame |
| `gameover*.png`          | Animação do Game Over (2 imagens) | GameOver     |
| `GAMEOVER.png`           | Texto "Game Over"                 | GameOver     |
| `vidamorta.png`          | Ícone de vida perdida             | HUD          |
| `vida1.png`              | Ícone de vida (fallback)          | HUD          |

### GIFS/ (GIFs Animados)

| Arquivo          | Descrição             | Usado em        |
| ---------------- | --------------------- | --------------- |
| `plug_anim3.gif` | Plugie em idle        | Menu, ArrowGame |
| `Vida.gif`       | Ícone de vida animado | Menu, HUD       |
| `Gif_Olhos.gif`  | Olhos na escuridão    | GoblinGame      |

### SFX/ (Sons)

| Arquivo               | Descrição             | Volume |
| --------------------- | --------------------- | ------ |
| `MenuMusic1.mp3`      | Música do menu 1      | 0.4    |
| `MenuMusic2.mp3`      | Música do menu 2      | 0.4    |
| `MenuMusic3.mp3`      | Música do menu 3      | 0.4    |
| `ArrowsBackMusic.mp3` | Música do ArrowGame   | 0.3    |
| `Arrows_Left.mp3`     | Som seta esquerda     | 0.7    |
| `Arrows_Right.mp3`    | Som seta direita      | 0.7    |
| `Arrows_Up.mp3`       | Som seta cima         | 0.7    |
| `Arrows_Down.mp3`     | Som seta baixo        | 0.7    |
| `Arrows_Wrong.mp3`    | Som de erro           | 0.4    |
| `Goblin_Waiting.mp3`  | Som de espera         | 0.5    |
| `Goblin_Footstep.mp3` | Passos do goblin      | 0.6    |
| `Goblin_Punch.mp3`    | Som do soco           | 0.7    |
| `Goblin_Growl.mp3`    | Rosnado do goblin     | 0.6    |
| `MazeAmbient.mp3`     | Ambiente do labirinto | 0.3    |
| `Maze_Jumpscare.mp3`  | Som do jumpscare      | 0.8    |
| `Maze_Win.mp3`        | Vitória no labirinto  | 0.6    |
| `GameOver.mp3`        | Música do game over   | 0.6    |

### Fonts/

| Arquivo         | Descrição                 |
| --------------- | ------------------------- |
| `monogram.ttf`  | Fonte pixel art principal |
| `Green Fuz.otf` | Fonte alternativa         |

---

## 🎮 Controles

| Tecla      | Ação                              | Contexto                 |
| ---------- | --------------------------------- | ------------------------ |
| ←          | Seta esquerda / Mover esquerda    | ArrowGame / LabirintGame |
| →          | Seta direita / Mover direita      | ArrowGame / LabirintGame |
| ↑          | Seta cima / Mover cima            | ArrowGame / LabirintGame |
| ↓          | Seta baixo / Mover baixo          | ArrowGame / LabirintGame |
| A-Z, 0-9   | Quick-time event                  | GoblinGame               |
| R          | Reiniciar jogo                    | Qualquer momento         |
| "gameover" | Cheat code para tela de Game Over | Debug                    |

---

## 🔧 Tecnologias Utilizadas

| Tecnologia         | Versão | Uso                                         |
| ------------------ | ------ | ------------------------------------------- |
| **p5.js**          | 1.6.0  | Biblioteca gráfica para canvas 2D           |
| **HTML5**          | -      | Estrutura, elementos de overlay, áudio      |
| **CSS3**           | -      | Estilização, animações hover, flexbox       |
| **JavaScript ES6** | -      | Classes, arrow functions, template literals |
| **Web Audio API**  | -      | Sistema de sons (`new Audio()`)             |

**CDN do p5.js:**

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
```

---

## 🧩 Funções e Métodos

### 📦 Funções Globais (p5.js)

| Função            | Arquivo   | Descrição                                       |
| ----------------- | --------- | ----------------------------------------------- |
| `preload()`       | sketch.js | Carrega todas as imagens antes do jogo iniciar  |
| `setup()`         | sketch.js | Inicializa canvas, HUD e minigames (executa 1x) |
| `draw()`          | sketch.js | Loop principal do jogo (60fps)                  |
| `keyPressed()`    | sketch.js | Detecta input e cheat codes                     |
| `windowResized()` | sketch.js | Redimensiona canvas quando janela muda          |
| `startGame()`     | sketch.js | Inicia o jogo (chamada pelo menu)               |

### 🎮 Funções do HUD

| Função                  | Arquivo   | Descrição                              |
| ----------------------- | --------- | -------------------------------------- |
| `createLivesHUD()`      | sketch.js | Cria container HTML com 4 GIFs de vida |
| `showLivesHUD()`        | sketch.js | Mostra o HUD de vidas                  |
| `hideLivesHUD()`        | sketch.js | Esconde o HUD de vidas                 |
| `updateLivesHUD(lives)` | sketch.js | Atualiza visual das vidas              |

### 💃 Funções do Plugie

| Função                | Arquivo   | Descrição                           |
| --------------------- | --------- | ----------------------------------- |
| `createPlugieHUD()`   | sketch.js | Cria elemento HTML do Plugie        |
| `showPlugieHUD()`     | sketch.js | Mostra o Plugie (só no ArrowGame)   |
| `hidePlugieHUD()`     | sketch.js | Esconde o Plugie                    |
| `animatePlugie(dir)`  | sketch.js | Anima dança na direção especificada |
| `resetPlugieToIdle()` | sketch.js | Volta Plugie ao estado parado       |

### 🎵 Funções de Música do Menu

| Função                 | Arquivo   | Descrição                        |
| ---------------------- | --------- | -------------------------------- |
| `getRandomMenuMusic()` | script.js | Retorna path de música aleatória |
| `startMenuMusic()`     | script.js | Inicia música com fade in        |
| `fadeInMusic()`        | script.js | Aumenta volume gradualmente      |
| `fadeOutMenuMusic()`   | script.js | Diminui volume e para música     |

### 🎯 Métodos do GameManager

| Método                  | Descrição                                  |
| ----------------------- | ------------------------------------------ |
| `addMinigame(minigame)` | Adiciona minigame à lista                  |
| `start()`               | Inicia o jogo (reseta tudo)                |
| `update()`              | Atualiza lógica a cada frame               |
| `draw()`                | Desenha minigame atual ou Game Over        |
| `restart()`             | Reinicia o jogo                            |
| `onResize(w, h)`        | Notifica minigames sobre redimensionamento |

### ⬅️ Métodos do ArrowGame

| Método                   | Descrição                      |
| ------------------------ | ------------------------------ |
| `start(speedMultiplier)` | Inicia/reinicia o minigame     |
| `update()`               | Move setas e verifica colisões |
| `draw()`                 | Desenha fundo, setas e overlay |
| `keyPressed()`           | Verifica acerto/erro           |
| `cleanup()`              | Para todos os sons             |
| `onResize(w, h)`         | Adapta posições ao tamanho     |

**Função auxiliar:**
| Função | Descrição |
|--------|-----------|
| `capitalize(s)` | "left" → "Left" (para acessar imagens) |

### 👹 Métodos do GoblinGame

| Método                   | Descrição                    |
| ------------------------ | ---------------------------- |
| `start(speedMultiplier)` | Inicia com teclas aleatórias |
| `update()`               | Atualiza animação e estados  |
| `draw()`                 | Desenha goblin e teclas      |
| `keyPressed()`           | Verifica tecla correta       |
| `cleanup()`              | Para todos os sons           |

**Funções auxiliares:**
| Função | Descrição |
|--------|-----------|
| `generateRandomKeys()` | Gera 3 teclas sem repetição |
| `createBackground()` | Cria elemento HTML para fundo GIF |
| `removeBackground()` | Remove elemento do fundo |
| `drawKeyPrompt()` | Desenha caixas das teclas |

### 🧩 Métodos do LabirintGame

| Método                              | Descrição                        |
| ----------------------------------- | -------------------------------- |
| `generateGrid()`                    | Cria array de células            |
| `index(c, r)`                       | Converte coordenadas para índice |
| `generateMaze()`                    | Gera labirinto aleatório         |
| `start(speedMultiplier)`            | Inicia minigame                  |
| `update()`                          | Move jogador e detecta colisão   |
| `draw()`                            | Desenha labirinto e jogador      |
| `collidesWallsCircle(px, py, cell)` | Verifica colisão circular        |
| `triggerJumpscare()`                | Ativa animação de jumpscare      |
| `triggerWin()`                      | Ativa animação de vitória        |
| `cleanup()`                         | Para todos os sons               |

### 🔲 Métodos da MazeCell

| Método                                      | Descrição                    |
| ------------------------------------------- | ---------------------------- |
| `checkNeighbors(grid, cols, rows, indexFn)` | Retorna vizinho não visitado |
| `removeWalls(other)`                        | Remove parede entre células  |
| `show()`                                    | Desenha paredes da célula    |

### 💀 Métodos do GameOver

| Método                   | Descrição                          |
| ------------------------ | ---------------------------------- |
| `loadImages()`           | Carrega imagens assincronamente    |
| `checkAllImagesLoaded()` | Verifica se tudo carregou          |
| `draw()`                 | Desenha tela completa com animação |

---

## 🔄 Fluxo do Jogo

```
┌─────────────────────────────────────────────────────────────────┐
│                       TELA DE LOGIN                             │
│  - Fundo preto com tema dourado                                 │
│  - Campo para digitar nome                                      │
│  - Lista de perfis existentes com highscores                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Criar perfil ou selecionar existente
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MENU INICIAL                            │
│  - Música de fundo (3 músicas aleatórias)                       │
│  - Botão Play, Créditos, Scores                                 │
│  - Modal de Ranking (botão Scores)                              │
│  - Modal de Configurações (engrenagem)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Clique em Play
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INÍCIO DO JOGO                              │
│  - Fade out da música                                           │
│  - Esconde menu, mostra canvas                                  │
│  - GameManager.start()                                          │
│  - 4 vidas, score = 0, speedMultiplier = 1                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LOOP DE MINIGAMES                           │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ ArrowGame   │ →  │ GoblinGame  │ →  │LabirintGame │ → ...    │
│  │ (Setas)     │    │ (QTE)       │    │ (Labirinto) │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                                                 │
│  Após completar os 3 → speedMultiplier *= 1.2 → Repete          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Vidas = 0
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        GAME OVER                                │
│  - Música triste                                                │
│  - Animação do personagem chorando                              │
│  - Score final + "NOVO RECORDE!" (se aplicável)                 │
│  - Nome do utilizador                                           │
│  - Highscore atualizado automaticamente                         │
│  - Botão Menu                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Clique em Menu
                              ▼
                     (Volta ao Menu Inicial, mantém login)
```

---

## 📝 Como Adicionar Novos Minigames

### 1. Criar o arquivo

Crie `Minigames/NomeDoMinigame.js`:

```javascript
class MeuMinigame {
  constructor() {
    // === FLAGS DE ESTADO ===
    this.finished = false;
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.score = 0;

    // === SONS ===
    this.bgMusic = new Audio("SFX/MeuMinigame_Music.mp3");
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3;
  }

  start(speedMultiplier) {
    // Reseta estado
    this.finished = false;
    this.mistakes = 0;
    this.score = 0;

    // Aplica dificuldade
    this.currentSpeed = this.BASE_SPEED * speedMultiplier;

    // Inicia som
    this.bgMusic.currentTime = 0;
    this.bgMusic.play();
  }

  update() {
    if (this.finished) return;

    // Lógica do minigame
    // ...

    // Verifica condição de vitória
    if (/* venceu */) {
      this.score = 100;
      this.finished = true;
    }

    // Verifica condição de derrota
    if (this.mistakes >= this.maxMistakes) {
      this.finished = true;
    }
  }

  draw() {
    // Desenha o minigame
    background(100);
    // ...
  }

  keyPressed() {
    // Processa input (opcional)
  }

  cleanup() {
    // Para todos os sons
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }

  onResize(w, h) {
    // Adapta ao tamanho da tela (opcional)
  }
}
```

### 2. Adicionar script no Index.html

```html
<!-- Antes de sketch.js -->
<script src="Minigames/MeuMinigame.js"></script>
```

### 3. Registrar no sketch.js

```javascript
function setup() {
  // ...
  manager = new GameManager();
  manager.addMinigame(new ArrowGame());
  manager.addMinigame(new GoblinGame());
  manager.addMinigame(new LabirintGame());
  manager.addMinigame(new MeuMinigame()); // ← Adicionar aqui
  // ...
}
```

---

## ⚙️ Variáveis Configuráveis

Todas as variáveis marcadas com `// <-- ALTERE AQUI` nos arquivos podem ser facilmente modificadas.

### GameManager (gameManager.js)

```javascript
this.lives = 4; // Vidas iniciais
this.maxLives = 4; // Máximo de vidas
this.speedMultiplier *= 1.2; // Aumento de velocidade por rodada (+20%)
```

### ArrowGame (Arrows.js)

```javascript
this.ARROW_SIZE = 120; // Tamanho das setas (pixels)
this.BLOCK_HEIGHT = 200; // Altura do bloco inferior
this.OVERLAY_SIZE = 140; // Tamanho do hitbox
this.MAX_ARROWS = 9; // Máximo de pares na tela
this.HITS_TO_WIN = 3; // Acertos para vencer
this.BASE_SPAWN_INTERVAL = 1200; // Intervalo entre spawns (ms)
this.BASE_SPEED = 5; // Velocidade das setas (pixels/frame)
this.maxMistakes = 3; // Erros para perder
this.winDelay = 500; // Delay após vencer (ms)
```

### GoblinGame (Goblin.js)

```javascript
this.TOTAL_FRAMES = 7; // Frames da animação
this.BASE_TIME_PER_FRAME = 200; // Tempo por frame (ms)
this.maxMistakes = 3; // Teclas erradas para perder
this.waitTimeMin = 2000; // Tempo mínimo de espera (ms)
this.waitTimeMax = 5000; // Tempo máximo de espera (ms)
```

### LabirintGame (Labirint.js)

```javascript
this.cellSize = 85; // Tamanho das células (pixels)
this.cols = 5; // Colunas do labirinto
this.rows = 6; // Linhas do labirinto
this.speed = 4; // Velocidade do jogador
this.playerRadius = 15; // Raio do jogador (colisão)
this.jumpscareCount = 3; // Número de imagens de jumpscare
this.jumpscareDuration = 1500; // Duração do jumpscare (ms)
```

### GameOver (GameOver.js)

```javascript
this.frameSwitchInterval = 400; // Velocidade da animação (ms)
this.gameoverSound.volume = 0.6; // Volume do som
```

### Menu (script.js)

```javascript
menuMusic.volume = 0.4; // Volume da música
vol += 0.02; // Velocidade do fade in
vol -= 0.02; // Velocidade do fade out
```

---

## 🎨 Créditos

Desenvolvido para a disciplina de **Programação Criativa**.

**Tecnologias:**

- p5.js — https://p5js.org/
- Fonte Monogram — https://datagoblin.itch.io/monogram

---

## 📄 Licença

Este projeto é apenas para fins educacionais.
