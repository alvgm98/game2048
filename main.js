let puntos = 0;

function iniciarJuego() {
   // Vaciamos el tablero y generamos 2 celdas.
   vaciarTablero();
   for (let i = 0; i < 2; i++) {
      generarCelda();
   }
}

function vaciarTablero() {
   for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
         // Reset de todas las celdas del tablero.
         resetCelda(document.getElementById("x" + x + "y" + y));
      }
   }
}

function comprobarDerrota() {
   // Comprobamos si existe alguna celda vacía.
   for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
         if (document.getElementById("x" + x + "y" + y).innerText == "") {
            return false;
         }
      }
   }
   // TODO. pantalla de derrota.
   return true;
}

/***************************************************************************************/
/**************************************** CELDAS ***************************************/
/***************************************************************************************/

const PROBABILIDADES_VALOR_CELDA = [
   { valor: 2, probabilidad: 0.7 },
   { valor: 4, probabilidad: 0.22 },
   { valor: 8, probabilidad: 0.08 },
];

const calcularValorCelda = () => {
   const calcValorCelda = Math.random();

   let acumuladorProb = 0;
   for (let prob of PROBABILIDADES_VALOR_CELDA) {
      acumuladorProb += prob.probabilidad;
      if (calcValorCelda < acumuladorProb) {
         return prob.valor;
      }
   }
};

async function generarCelda() {
   await new Promise((resolve) => setTimeout(resolve, 150));
   // Si no hay celdas disponibles termina el juego.
   if (comprobarDerrota()) {
      console.log(comprobarDerrota());
      return;
   }

   // Calcula el valor que tendra la celda.
   let valor = calcularValorCelda();

   // Imprimimos la celda aleatoriamente en una celda vacía.
   do {
      const x = Math.floor(Math.random() * 4);
      const y = Math.floor(Math.random() * 4);
      const celda = document.getElementById("x" + x + "y" + y);

      if (celda.innerText == "") {
         celda.innerText = valor;
         celda.classList.add("generar-celda-animacion", "celda-" + valor);
         return;
      }

      // Elimina la animación.
      setTimeout(() => celda.classList.remove("generar-celda-animacion"), 250);
   } while (true);
}

function resetCelda(celda) {
   celda.className = "celda";
   celda.innerText = "";
}

function moverCelda(celdaMover, celdaVacia, mov) {
   // Inserta los datos la celda que se mueve en la celda vacía.
   celdaVacia.innerText = celdaMover.innerText;
   celdaVacia.className = "";
   celdaVacia.classList.add(
      "mover-celda-" + mov + "-animacion",
      "celda",
      "celda-" + celdaMover.innerText
   );

   // Elimina la animación.
   setTimeout(
      () => celdaVacia.classList.remove("mover-celda-" + mov + "-animacion"),
      250
   );

   // Reset de la celda que deja libre.
   resetCelda(celdaMover);
}

async function fusionarCeldas(celdaMover, celdaPosicionFinal, mov) {
   // Valor de la celda resultante.
   const valor = celdaMover.innerText * 2;
   // Movimiento de la celda antes de resetearla.
   celdaMover.classList.add(".fusion-mover-celda-" + mov + "-animacion");
   await new Promise((resolve) => setTimeout(resolve, 150));

   // Fusiona ambas celdas.
   celdaPosicionFinal.innerText = valor;
   celdaPosicionFinal.className = "";
   celdaPosicionFinal.classList.add(
      "fusionar-celda-animacion",
      "celda",
      "celda-" + valor
   );

   // Elimina la animación.
   setTimeout(
      () => celdaPosicionFinal.classList.remove("fusionar-celda-animacion"),
      250
   );

   // Reset de la celda que deja libre.
   resetCelda(celdaMover);

   // Actualiza la puntuación.
   puntos += valor;
   document.getElementById("puntos").innerText = puntos;
}

/***************************************************************************************/
/************************************* MOVIMIENTOS *************************************/
/***************************************************************************************/

/**********************
 * POR CADA MOVIMIENTO:
 * -> Primero movemos las celdas en la direccion seleccionada para evitar los espacios en blanco.
 * -> Segundo fusionamos todas las celdas que permita el movimiento.
 * -> Tercero se moverán las celdas en la direccion seleccionada para eliminar los espacios en blanco que genera la fusión.
 * -> Por último. Se generará una celda nueva, si ha sido un movimiento válido.
 **********************/

/* Se hace en este orden el algoritmo para evitar fusionar celdas que corresponderían a otro movimiento 
   y fusionar celdas que se encuentran separadas pero pertenecen a ese movimiento. */

function moveUp() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.

   // PRIMERA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 1; y <= 3; y++) {
         for (let x = 0; x < 4; x++) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaUp = document.getElementById("x" + x + "y" + (y - 1));

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaUp.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaUp, "up");
               movimientoValido = true;
            }
         }
      }
   }

   // FUSION DE CELDAS.
   for (let y = 1; y <= 3; y++) {
      for (let x = 0; x < 4; x++) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaUp = document.getElementById("x" + x + "y" + (y - 1));

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda actual y la celda inferior tienen el mismo valor, se fusionan las celdas.
         if (celda.innerText == celdaUp.innerText) {
            fusionarCeldas(celda, celdaUp);
            movimientoValido = true;
         }
      }
   }

   // SEGUNDA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 1; y <= 3; y++) {
         for (let x = 0; x < 4; x++) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaUp = document.getElementById("x" + x + "y" + (y - 1));

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaUp.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaUp, "up");
               movimientoValido = true;
            }
         }
      }
   }

   // GENERAR CELDA
   if (movimientoValido) {
      generarCelda();
   }
}

function moveRight() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.

   // PRIMERA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 0; y < 4; y++) {
         for (let x = 2; x >= 0; x--) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaRight = document.getElementById("x" + (x + 1) + "y" + y);

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaRight.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaRight, "right");
               movimientoValido = true;
            }
         }
      }
   }

   // FUSION DE CELDAS.
   for (let y = 0; y < 4; y++) {
      for (let x = 2; x >= 0; x--) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaRight = document.getElementById("x" + (x + 1) + "y" + y);

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda actual y la celda inferior tienen el mismo valor, se fusionan las celdas.
         if (celda.innerText == celdaRight.innerText) {
            fusionarCeldas(celda, celdaRight);
            movimientoValido = true;
         }
      }
   }

   // SEGUNDA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 0; y < 4; y++) {
         for (let x = 2; x >= 0; x--) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaRight = document.getElementById("x" + (x + 1) + "y" + y);

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaRight.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaRight, "right");
               movimientoValido = true;
            }
         }
      }
   }

   // GENERAR CELDA
   if (movimientoValido) {
      generarCelda();
   }
}

function moveDown() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.

   // PRIMERA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 2; y >= 0; y--) {
         for (let x = 0; x < 4; x++) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaDown = document.getElementById("x" + x + "y" + (y + 1));

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaDown.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaDown, "down");
               movimientoValido = true;
            }
         }
      }
   }

   // FUSION DE CELDAS.
   for (let y = 2; y >= 0; y--) {
      for (let x = 0; x < 4; x++) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaDown = document.getElementById("x" + x + "y" + (y + 1));

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda actual y la celda inferior tienen el mismo valor, se fusionan las celdas.
         if (celda.innerText == celdaDown.innerText) {
            fusionarCeldas(celda, celdaDown);
            movimientoValido = true;
         }
      }
   }

   // SEGUNDA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 2; y >= 0; y--) {
         for (let x = 0; x < 4; x++) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaDown = document.getElementById("x" + x + "y" + (y + 1));

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaDown.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaDown, "down");
               movimientoValido = true;
            }
         }
      }
   }

   // GENERAR CELDA
   if (movimientoValido) {
      generarCelda();
   }
}

function moveLeft() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.

   // PRIMERA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 0; y < 4; y++) {
         for (let x = 1; x <= 3; x++) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaLeft = document.getElementById("x" + (x - 1) + "y" + y);

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaLeft.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaLeft, "left");
               movimientoValido = true;
            }
         }
      }
   }

   // FUSION DE CELDAS.
   for (let y = 0; y < 4; y++) {
      for (let x = 1; x <= 3; x++) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaLeft = document.getElementById("x" + (x - 1) + "y" + y);

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda actual y la celda inferior tienen el mismo valor, se fusionan las celdas.
         if (celda.innerText == celdaLeft.innerText) {
            fusionarCeldas(celda, celdaLeft);
            movimientoValido = true;
         }
      }
   }

   // SEGUNDA BARRIDA DE MOVIMIENTO DE CELDAS.
   for (let i = 0; i < 3; i++) {
      for (let y = 0; y < 4; y++) {
         for (let x = 1; x <= 3; x++) {
            const celda = document.getElementById("x" + x + "y" + y);
            const celdaLeft = document.getElementById("x" + (x - 1) + "y" + y);

            // Si la celda esta vacia pasa al siguiente bucle.
            if (celda.innerText == "" || celda.innerText == null) {
               continue;
            }

            // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
            if (celdaLeft.innerText == "" || celda.innerText == null) {
               moverCelda(celda, celdaLeft, "left");
               movimientoValido = true;
            }
         }
      }
   }

   // GENERAR CELDA
   if (movimientoValido) {
      generarCelda();
   }
}

/* EVENTO LISTENER PARA CONTROLAR LOS MOVIMIENTOS POR TECLADO */
document.addEventListener("keydown", function (event) {
   if (event.key == "ArrowUp") {
      moveUp();
   }
   if (event.key == "ArrowRight") {
      moveRight();
   }
   if (event.key == "ArrowDown") {
      moveDown();
   }
   if (event.key == "ArrowLeft") {
      moveLeft();
   }
});
