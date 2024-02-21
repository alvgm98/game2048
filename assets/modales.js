document.getElementById("modalComoJugar").show();
document.getElementById("overlay-oscuro").style.display = "block";

function cerrarModal(id) {
   document.getElementById(id).className = "fade-out-animation";
   document
      .getElementById("overlay-oscuro")
      .classList.add("fade-out-animation");

   setTimeout(() => document.getElementById(id).close(), 500);
}

function showModalDerrota() {
   document.getElementById("modalDerrota").classList.add("fade-in-animation")
   document.getElementById("puntosDerrota").innerText = puntos;
   setTimeout(() => document.getElementById("modalDerrota").show(), 500);
}
 