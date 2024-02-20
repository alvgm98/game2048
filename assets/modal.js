document.getElementById("modalComoJugar").show();
document.getElementById("overlay-oscuro").style.display = "block";

function cerrarModal() {
   document.getElementById("modalComoJugar").className = "fade-out-animation";
   document
      .getElementById("overlay-oscuro")
      .classList.add("fade-out-animation");

   setTimeout(() => document.getElementById("modalComoJugar").close(), 800);
}
