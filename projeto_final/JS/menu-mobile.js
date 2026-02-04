// Menu Mobile - Toggle hamburger
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", function () {
      menu.classList.toggle("ativo");
      // Animar o hamburger
      this.classList.toggle("ativo");
    });

    // Fechar menu ao clicar em um link
    const menuLinks = menu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        menu.classList.remove("ativo");
        menuToggle.classList.remove("ativo");
      });
    });

    // Fechar menu ao clicar fora
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
        menu.classList.remove("ativo");
        menuToggle.classList.remove("ativo");
      }
    });
  }
});
