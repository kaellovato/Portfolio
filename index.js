// ELEMENTOS GLOBAIS
const history = document.getElementById("history");
const commandInput = document.getElementById("command");
const keySound = document.getElementById("keySound");
const errorSound = document.getElementById("errorSound");
const clearSound = document.getElementById("clearSound");

// ESTADO DO TERMINAL
let terminalState = "root";

// PROJETOS
const projects = [
  {
    id: 1,
    title: "Experiência em Realidade Virtual",
    image: "rvprojeto.png",
    description: `Recriação do Terremoto de Lisboa (1755) na Unreal Engine 5.

Destaques:
- Ambientação histórica realista com modelagem 3D
- Efeitos visuais e sonoros imersivos
- Navegação em primeira pessoa

Ferramentas: Unreal Engine 5, Quixel, Fab

Status: Finalizado e apresentado em banca.`,
    tech: "Unreal Engine 5",
    link: null,
    screenshots: ["rvprojeto.png"],
  },
  {
    id: 2,
    title: "Plugies Dreamy Chaos",
    image: "Projetos/PlugiesDreamyChaos/plugies-menu.png",
    description: `Jogo interativo desenvolvido em p5.js.

Destaques:
- Arte com personagens carismáticos
- Sistema de dificuldade progressiva
- Trilha sonora e efeitos imersivos

Conceito: Criado para um projeto de disciplina universitária focado em programação em JavaScript.`,
    tech: "p5.js / JavaScript",
    link: "ProjetoProg/Index.html",
    mobilePlayable: false,
    screenshots: [
      "Projetos/PlugiesDreamyChaos/plugies-menu.png",
      "Projetos/PlugiesDreamyChaos/plugies-creditos.png",
      "Projetos/PlugiesDreamyChaos/plugies-jogo.png",
      "Projetos/PlugiesDreamyChaos/plugies-loading.png",
      "Projetos/PlugiesDreamyChaos/plugies-vitoria.png",
    ],
  },
  {
    id: 3,
    title: "CACB - Site Institucional",
    image: "Projetos/Cacb/cacb-home-print.png",
    description: `Sistema web para o Centro Académico Clínico das Beiras.

Destaques:
- Interface intuitiva e moderna
- Remodelação total do site original
- Design responsivo para uso mobile

Objetivo: Melhorar a experiência do usuário e facilitar o acesso a informações clínicas e institucionais.`,
    tech: "HTML / CSS / JavaScript",
    link: null,
    mobilePlayable: true,
    screenshots: [
      "Projetos/Cacb/cacb-home-print.png",
      "Projetos/Cacb/cacb-eventos-print.png",
      "Projetos/Cacb/cacb-contatos-print.png",
      "Projetos/Cacb/cacb-missao-print.png",
    ],
  },
];

// COMANDOS
const commands = {
  help: `Comandos disponiveis:
    about       - Sobre mim
    projects    - Meus projetos
    contact     - Me envie mensagem
    clear       - Limpar terminal`,

  about: function (container) {
    const aboutContainer = document.createElement("div");
    aboutContainer.className = "about-container";

    const img = document.createElement("img");
    img.src = "KaelBg.png";
    img.alt = "Kael Lovato";
    img.className = "about-img";

    const textContainer = document.createElement("div");
    textContainer.className = "about-text-terminal";

    aboutContainer.appendChild(img);
    aboutContainer.appendChild(textContainer);
    container.appendChild(aboutContainer);

    setTimeout(() => {
      const text = `Sou Kael Lovato, desenvolvedor apaixonado por tecnologia, aprendizado continuo e experiencias imersivas.
Trabalho com jogos, web e design interativo.<br>
LinkedIn: <a href="https://linkedin.com/in/kael-lovato" target="_blank" rel="noopener noreferrer">linkedin.com/in/kael-lovato</a>
Email: <a href="mailto:kaellovato5@gmail.com">kaellovato5@gmail.com</a><span id="email-line"></span><br>`;

      typeEffect(text, textContainer, () => {
        setTimeout(() => {
          const emailLine = document.getElementById("email-line");
          const copyButton = document.createElement("button");
          copyButton.textContent = "Copiar e-mail";
          copyButton.onclick = copyEmail;
          copyButton.className = "copy-btn";
          copyButton.style.marginLeft = "8px";
          emailLine.appendChild(copyButton);

          if (!document.getElementById("copyPopup")) {
            const popup = document.createElement("div");
            popup.id = "copyPopup";
            popup.className = "popup";
            popup.textContent = "E-mail copiado!";
            document.body.appendChild(popup);
          }
        }, 25);
      });
    }, 500);
  },

  contact: function (container) {
    const contactContainer = document.createElement("div");
    contactContainer.className = "contact-container fade-in";
    container.appendChild(contactContainer);

    // Header
    const header = document.createElement("div");
    header.className = "contact-header";
    header.innerHTML = `
      <span class="contact-header-title">Envie uma mensagem</span>
    `;
    contactContainer.appendChild(header);

    // Form
    const form = document.createElement("div");
    form.className = "contact-form";
    contactContainer.appendChild(form);

    // Nome field
    const nameField = document.createElement("div");
    nameField.className = "contact-field";
    const nameLabel = document.createElement("label");
    nameLabel.className = "contact-label";
    nameLabel.textContent = "Nome";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Digite seu nome...";
    nameInput.className = "contact-input";
    nameField.appendChild(nameLabel);
    nameField.appendChild(nameInput);
    form.appendChild(nameField);

    // Email field
    const emailField = document.createElement("div");
    emailField.className = "contact-field";
    const emailLabel = document.createElement("label");
    emailLabel.className = "contact-label";
    emailLabel.textContent = "E-mail";
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "seu@email.com";
    emailInput.className = "contact-input";
    emailField.appendChild(emailLabel);
    emailField.appendChild(emailInput);
    form.appendChild(emailField);

    // Message field
    const messageField = document.createElement("div");
    messageField.className = "contact-field";
    const messageLabel = document.createElement("label");
    messageLabel.className = "contact-label";
    messageLabel.textContent = "Mensagem";
    const messageInput = document.createElement("textarea");
    messageInput.placeholder = "Escreva sua mensagem aqui...";
    messageInput.className = "contact-textarea";
    messageInput.maxLength = 500;
    messageField.appendChild(messageLabel);
    messageField.appendChild(messageInput);
    form.appendChild(messageField);

    // Footer with char count and button
    const footer = document.createElement("div");
    footer.className = "contact-footer";

    const charCount = document.createElement("span");
    charCount.className = "char-count";
    charCount.innerHTML = "0 / 500 caracteres";

    messageInput.addEventListener("input", () => {
      const len = messageInput.value.length;
      charCount.innerHTML = `${len} / 500 caracteres`;
      charCount.classList.remove("warning", "limit");
      if (len >= 450) charCount.classList.add("limit");
      else if (len >= 350) charCount.classList.add("warning");
    });

    const sendButton = document.createElement("button");
    sendButton.innerHTML = "Enviar mensagem";
    sendButton.className = "contact-btn";

    footer.appendChild(charCount);
    footer.appendChild(sendButton);
    form.appendChild(footer);

    // Feedback
    const feedback = document.createElement("div");
    feedback.className = "contact-feedback";
    feedback.style.display = "none";
    form.appendChild(feedback);

    function isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email.toLowerCase());
    }

    function validateField(field, isValid) {
      field.classList.remove("invalid", "valid");
      field.classList.add(isValid ? "valid" : "invalid");
    }

    sendButton.onclick = () => {
      const nameValid = nameInput.value.trim() !== "";
      const emailValid = isValidEmail(emailInput.value);
      const messageValid = messageInput.value.trim() !== "";

      validateField(nameInput, nameValid);
      validateField(emailInput, emailValid);
      validateField(messageInput, messageValid);

      if (!nameValid || !emailValid || !messageValid) {
        feedback.textContent =
          "Por favor, preencha todos os campos corretamente.";
        feedback.className = "contact-feedback error";
        feedback.style.display = "block";
        return;
      }

      sendButton.disabled = true;
      sendButton.innerHTML = "Enviando...";

      fetch("https://formsubmit.co/ajax/kaellovato5@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.value,
          email: emailInput.value,
          message: messageInput.value,
        }),
      })
        .then((res) => res.json())
        .then(() => {
          feedback.textContent =
            "Mensagem enviada com sucesso! Obrigado pelo contato.";
          feedback.className = "contact-feedback success";
          feedback.style.display = "block";
          nameInput.value = "";
          emailInput.value = "";
          messageInput.value = "";
          charCount.innerHTML = "0 / 500 caracteres";
          charCount.classList.remove("warning", "limit");
          [nameInput, emailInput, messageInput].forEach((i) =>
            i.classList.remove("valid", "invalid"),
          );
          sendButton.disabled = false;
          sendButton.innerHTML = "Enviar mensagem";
        })
        .catch(() => {
          feedback.textContent = "Erro ao enviar. Tente novamente mais tarde.";
          feedback.className = "contact-feedback error";
          feedback.style.display = "block";
          sendButton.disabled = false;
          sendButton.innerHTML = "Enviar mensagem";
        });
    };
  },

  projects: "PROJECTS_SUBMENU",
  clear: "CLEAR",
};

// Função de auto-scroll para acompanhar o texto
function autoScroll() {
  // Scroll suave para o final da página (funciona em mobile e desktop)
  const inputLine = document.querySelector(".input-line");
  if (inputLine) {
    inputLine.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  // Fallback para garantir scroll em todos os casos
  const terminalBody = document.querySelector(".terminal-body");
  if (terminalBody) {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// Efeito de digitacao
function typeEffect(text, element, callback) {
  let i = 0;

  function tick() {
    if (i >= text.length) {
      element.innerHTML = text;
      autoScroll();
      if (callback) callback();
      return;
    }

    const char = text[i];

    if (char === "<") {
      const close = text.indexOf(">", i);
      const tag = text.slice(i, close + 1);
      element.insertAdjacentHTML("beforeend", tag);
      i = close + 1;
    } else {
      element.appendChild(document.createTextNode(char));
      if (![" ", "\n"].includes(char) && i % 5 === 0) {
        keySound.currentTime = 0;
        keySound.volume = 0.1;
        keySound.play().catch(() => {});
      }
      i++;
    }

    // Auto-scroll a cada 3 caracteres para acompanhar em tempo real
    if (i % 3 === 0) {
      autoScroll();
    }

    setTimeout(tick, 10);
  }

  tick();
}

function copyEmail() {
  requestAnimationFrame(() => {
    const email = "kaellovato5@gmail.com";
    navigator.clipboard
      .writeText(email)
      .then(() => {
        const popup = document.getElementById("copyPopup");
        popup.classList.add("show");
        setTimeout(() => {
          popup.classList.remove("show");
        }, 2000);
      })
      .catch(() => {
        alert("Falha ao copiar o e-mail.");
      });
  });
}

function clearWithGlitch(callback) {
  const lines = [...history.children];
  let currentLine = lines.length - 1;
  function eraseLine() {
    if (currentLine < 0) {
      if (callback) callback();
      return;
    }
    const line = lines[currentLine];
    line.classList.add("glitch-out");
    clearSound.currentTime = 0;
    clearSound.volume = 0.5;
    clearSound.play().catch(() => {});
    setTimeout(() => {
      line.remove();
      currentLine--;
      eraseLine();
    }, 130);
  }
  eraseLine();
}

function showHelp(callback) {
  const helpMessage = `Comandos disponiveis:
    about       - Sobre mim
    projects    - Meus projetos
    contact     - Me envie mensagem
    clear       - Limpar terminal`;

  const helpResponse = document.createElement("div");
  helpResponse.style.whiteSpace = "pre-wrap";
  history.appendChild(helpResponse);
  typeEffect(helpMessage, helpResponse, callback);
}

// Render project with screenshots
function renderProject(project, container) {
  const projectContainer = document.createElement("div");
  projectContainer.className = "project-container fade-in";

  const title = document.createElement("div");
  title.className = "project-title";
  title.textContent = project.title;

  const gallery = document.createElement("div");
  gallery.className = "project-gallery";

  const screenshots = project.screenshots || [project.image];
  screenshots.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = project.title;
    img.className = "project-img";
    gallery.appendChild(img);
  });

  const textContainer = document.createElement("div");
  textContainer.className = "project-text";

  const meta = document.createElement("div");
  meta.className = "project-meta";
  meta.innerHTML = `<span><span class="label">Tech:</span> ${project.tech}</span>`;

  projectContainer.appendChild(title);
  projectContainer.appendChild(gallery);
  projectContainer.appendChild(textContainer);
  projectContainer.appendChild(meta);

  container.appendChild(projectContainer);

  setTimeout(() => {
    typeEffect(project.description, textContainer);
  }, 300);
}

// Menu de projetos
function showProjectMenu(response) {
  terminalState = "projects";
  let menuText = "Projetos disponiveis:\n";
  projects.forEach((p, i) => {
    menuText += `[${i + 1}] ${p.title}\n`;
  });
  menuText += "\nDigite o numero do projeto ou 'exit' para voltar.";
  typeEffect(menuText, response);
}

// Detalhes de cada projeto
function showProjectDetails(option, response) {
  const index = parseInt(option) - 1;
  if (index >= 0 && index < projects.length) {
    renderProject(projects[index], response);
  } else {
    typeEffect(`Comando invalido. Use 1-${projects.length} ou exit.`, response);
  }
}

// Input handler
commandInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const input = commandInput.value.trim();
    if (!input) return;

    const output = document.createElement("div");
    output.className = "command-echo";
    output.innerHTML = `<span class="prompt-symbol">$</span> ${input}`;
    history.appendChild(output);

    const response = document.createElement("div");
    history.appendChild(response);

    if (terminalState === "projects") {
      if (input.toLowerCase() === "exit") {
        terminalState = "root";
        typeEffect("Saindo da seção de projetos...", response, () => {
          setTimeout(() => {
            showHelp();
          }, 500);
        });
      } else {
        showProjectDetails(input, response);
      }
    } else {
      const cmd = commands[input.toLowerCase()];
      if (cmd === "CLEAR") {
        clearWithGlitch();
      } else if (cmd === "PROJECTS_SUBMENU") {
        showProjectMenu(response);
      } else if (typeof cmd === "function") {
        cmd(response);
      } else if (cmd) {
        typeEffect(cmd, response);
      } else {
        errorSound.currentTime = 0;
        errorSound.volume = 1.0;
        errorSound.play().catch(() => {});
        typeEffect(`Comando nao reconhecido: ${input}`, response);
      }
    }

    commandInput.value = "";
    autoScroll();
  }
});

// Zoom em imagens
document.addEventListener("click", function (e) {
  if (
    e.target.tagName === "IMG" &&
    (e.target.closest(".project-container") ||
      e.target.closest(".about-container"))
  ) {
    const imgSrc = e.target.src;

    const overlay = document.createElement("div");
    overlay.className = "image-modal-overlay";

    const zoomedImg = document.createElement("img");
    zoomedImg.src = imgSrc;

    overlay.appendChild(zoomedImg);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => {
      overlay.remove();
    });
  }
});

// Observer para fade-in em imagens
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        const imgs = node.querySelectorAll("img");
        imgs.forEach((img) => {
          img.classList.add("fade-in");
        });
      }
    });
  });
});

observer.observe(document.getElementById("terminal"), {
  childList: true,
  subtree: true,
});

// Transição suave para GUI
document.addEventListener("DOMContentLoaded", () => {
  const portfolioLink = document.querySelector(".portfolio-link");
  if (portfolioLink) {
    portfolioLink.addEventListener("click", (e) => {
      e.preventDefault();

      // Ocultar campo de input
      const inputLine = document.querySelector(".input-line");
      if (inputLine) inputLine.style.display = "none";

      const history = document.getElementById("history");

      const output = document.createElement("div");
      output.className = "command-echo";
      output.innerHTML = `<br><span class="prompt-symbol">$</span> ./start_gui.sh`;
      history.appendChild(output);

      const response = document.createElement("div");
      response.style.color = "var(--cyan)";
      response.style.marginTop = "10px";
      response.style.whiteSpace = "pre-wrap";
      history.appendChild(response);

      const text =
        "ESTABLISHING NEURAL LINK...\nDECRYPTING CORE MODULES [OK]\nLOADING VIRTUAL_ENVIRONMENT...\nBYPASSING HARDWARE LIMITS...\nACCESS GRANTED.";

      // typeEffect já possui a chamada de keySound e autoScroll
      typeEffect(text, response, () => {
        setTimeout(() => {
          // Tocar som de fechar terminal
          const clearSound = document.getElementById("clearSound");
          if (clearSound) {
            clearSound.currentTime = 0;
            clearSound.volume = 0.5;
            clearSound.play().catch(() => {});
          }

          document.body.classList.add("terminal-closing");

          setTimeout(() => {
            window.location.href = portfolioLink.href + "?skipBoot=true";
          }, 500);
        }, 500);
      });
    });
  }
});
