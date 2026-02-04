let slides = document.querySelectorAll(".slide");
let indice = 0;

function mostrarSlide() {
    slides.forEach(slide => slide.classList.remove("ativo"));
    slides[indice].classList.add("ativo");

    indice++;
    if (indice >= slides.length) {
        indice = 0;
    }
}

setInterval(mostrarSlide, 4000); // troca a cada 4 segundos
