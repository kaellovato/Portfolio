// ============================================================
// USER SYSTEM — Sistema de Utilizadores e Highscores
// ============================================================
// Gerencia:
// - Perfis de utilizadores (nome + highscore)
// - Armazenamento persistente via localStorage
// - Seleção de utilizador atual
// - Atualização de highscores
// ============================================================

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================

let currentUser = null; // Utilizador atualmente logado { name, highscore }
const USERS_STORAGE_KEY = "plugies_users"; // Chave do localStorage

// ============================================================
// getAllUsers: Retorna todos os utilizadores salvos
// ============================================================
function getAllUsers() {
  const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
  if (usersJSON) {
    try {
      return JSON.parse(usersJSON);
    } catch (e) {
      console.error("Erro ao carregar utilizadores:", e);
      return [];
    }
  }
  return [];
}

// ============================================================
// saveAllUsers: Salva a lista de utilizadores no localStorage
// ============================================================
function saveAllUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// ============================================================
// createUser: Cria um novo utilizador ou seleciona existente
// ============================================================
function createUser(name) {
  if (!name || name.trim() === "") return null;

  const cleanName = name.trim();
  const users = getAllUsers();

  // Verifica se já existe
  const existingUser = users.find(
    (u) => u.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (existingUser) {
    // Utilizador já existe, apenas seleciona
    currentUser = existingUser;
  } else {
    // Cria novo utilizador
    const newUser = {
      name: cleanName,
      highscore: 0,
      createdAt: Date.now(),
    };
    users.push(newUser);
    saveAllUsers(users);
    currentUser = newUser;
  }

  // Salva o utilizador atual para sessão
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  return currentUser;
}

// ============================================================
// selectUser: Seleciona um utilizador existente pelo nome
// ============================================================
function selectUser(name) {
  const users = getAllUsers();
  const user = users.find((u) => u.name === name);

  if (user) {
    currentUser = user;
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    return currentUser;
  }
  return null;
}

// ============================================================
// deleteUser: Remove um utilizador da lista
// ============================================================
function deleteUser(name) {
  let users = getAllUsers();
  users = users.filter((u) => u.name !== name);
  saveAllUsers(users);

  // Se era o utilizador atual, limpa
  if (currentUser && currentUser.name === name) {
    currentUser = null;
    sessionStorage.removeItem("currentUser");
  }
}

// ============================================================
// getCurrentUser: Retorna o utilizador atualmente logado
// ============================================================
function getCurrentUser() {
  if (currentUser) return currentUser;

  // Tenta recuperar da sessão
  const sessionUser = sessionStorage.getItem("currentUser");
  if (sessionUser) {
    try {
      currentUser = JSON.parse(sessionUser);
      return currentUser;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// ============================================================
// updateHighscore: Atualiza o highscore se for maior
// ============================================================
function updateHighscore(score) {
  if (!currentUser) return false;

  if (score > currentUser.highscore) {
    currentUser.highscore = score;

    // Atualiza no localStorage
    const users = getAllUsers();
    const userIndex = users.findIndex((u) => u.name === currentUser.name);
    if (userIndex !== -1) {
      users[userIndex].highscore = score;
      saveAllUsers(users);
    }

    // Atualiza na sessão
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

    return true; // Novo recorde!
  }
  return false;
}

// ============================================================
// getHighscoreRanking: Retorna utilizadores ordenados por score
// ============================================================
function getHighscoreRanking() {
  const users = getAllUsers();
  return users.sort((a, b) => b.highscore - a.highscore);
}

// ============================================================
// RENDERIZAÇÃO DA LISTA DE UTILIZADORES
// ============================================================

function renderUserList() {
  const userListDiv = document.getElementById("userList");
  if (!userListDiv) return;

  const users = getAllUsers();

  // Ordena por highscore (maior primeiro)
  users.sort((a, b) => b.highscore - a.highscore);

  if (users.length === 0) {
    userListDiv.innerHTML =
      '<p id="noUsersMessage">Nenhum perfil criado ainda. Escreve o teu nome acima!</p>';
    return;
  }

  userListDiv.innerHTML = "";

  users.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "user-item";
    userItem.innerHTML = `
      <span class="user-name">${escapeHTML(user.name)}</span>
      <span class="user-score">★ ${user.highscore}</span>
      <button class="delete-user" title="Apagar perfil">✕</button>
    `;

    // Clique no item para selecionar
    userItem.addEventListener("click", (e) => {
      // Ignora se clicou no botão de apagar
      if (e.target.classList.contains("delete-user")) return;

      selectUser(user.name);
      enterGame();
    });

    // Botão de apagar
    const deleteBtn = userItem.querySelector(".delete-user");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Apagar o perfil "${user.name}"?`)) {
        deleteUser(user.name);
        renderUserList();
      }
    });

    userListDiv.appendChild(userItem);
  });
}

// ============================================================
// escapeHTML: Previne XSS escapando caracteres HTML
// ============================================================
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// enterGame: Transição da tela de login para o menu
// ============================================================
function enterGame() {
  const loginScreen = document.getElementById("loginScreen");
  const menu = document.getElementById("menu");

  if (loginScreen && menu) {
    // Animação de saída
    loginScreen.style.transition = "opacity 0.4s ease";
    loginScreen.style.opacity = "0";

    setTimeout(() => {
      loginScreen.style.display = "none";
      menu.style.display = "block";

      // Carrega as configurações de volume do utilizador
      if (typeof loadSavedVolumes === "function") {
        loadSavedVolumes();
      }

      // Inicia a música do menu (se a função existir)
      if (typeof startMenuMusic === "function") {
        startMenuMusic();
      }
    }, 400);
  }
}

// ============================================================
// INICIALIZAÇÃO DA TELA DE LOGIN
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("loginScreen");
  const usernameInput = document.getElementById("usernameInput");
  const createUserBtn = document.getElementById("createUserBtn");

  // Se não há tela de login, estamos no jogo
  if (!loginScreen) return;

  // Renderiza a lista de utilizadores
  renderUserList();

  // Evento do botão "Entrar"
  if (createUserBtn) {
    createUserBtn.addEventListener("click", () => {
      const name = usernameInput.value.trim();
      if (name) {
        createUser(name);
        enterGame();
      }
    });
  }

  // Enter para submeter
  if (usernameInput) {
    usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const name = usernameInput.value.trim();
        if (name) {
          createUser(name);
          enterGame();
        }
      }
    });

    // Foca no input ao carregar
    setTimeout(() => usernameInput.focus(), 100);
  }
});
