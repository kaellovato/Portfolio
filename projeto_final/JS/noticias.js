const noticias = document.querySelectorAll(".noticia");
const btnPrev = document.getElementById("prevNoticia");
const btnNext = document.getElementById("nextNoticia");

let indiceNoticia = 0;
let intervalo;

/* Mostrar notícia */
function mostrarNoticia(index) {
    noticias.forEach(n => n.classList.remove("ativa"));
    noticias[index].classList.add("ativa");
}

/* Próxima */
function proximaNoticia() {
    indiceNoticia = (indiceNoticia + 1) % noticias.length;
    mostrarNoticia(indiceNoticia);
}

/* Anterior */
function noticiaAnterior() {
    indiceNoticia =
        (indiceNoticia - 1 + noticias.length) % noticias.length;
    mostrarNoticia(indiceNoticia);
}

/* Botões */
btnNext.addEventListener("click", () => {
    proximaNoticia();
    reiniciarAuto();
});

btnPrev.addEventListener("click", () => {
    noticiaAnterior();
    reiniciarAuto();
});

/* Automático */
function iniciarAuto() {
    intervalo = setInterval(proximaNoticia, 5000); // 5 segundos
}

function reiniciarAuto() {
    clearInterval(intervalo);
    iniciarAuto();
}

mostrarNoticia(indiceNoticia);
iniciarAuto();
