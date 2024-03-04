document.getElementById("modalComoJugar").show();
document.getElementById("overlay-oscuro").style.display = "block";

// Cierra el modal que recibe por id.
function cerrarModal(id) {
   document.getElementById(id).className = "fade-out-animation";
   document
      .getElementById("overlay-oscuro")
      .classList.add("fade-out-animation");

   // Cierra el modal al terminar la animación.
   setTimeout(() => document.getElementById(id).close(), 500);
}

// Muestra el modal de Victoria o Derrota. Con los puntos que lleva el usuario.
function showModal(typeEndGame) {
   document
      .getElementById("modal" + typeEndGame)
      .classList.add("fade-in-animation");
   document.getElementById("puntos" + typeEndGame).innerText = puntos;

   // Muestra el modal al terminar la animación.
   setTimeout(() => document.getElementById("modal" + typeEndGame).show(), 500);
}
