let puntos = 0;
const setPuntos = () => {
   document.getElementById("puntos").innerText = +puntos;
};

function iniciarJuego() {
   // Vaciamos el tablero y generamos 2 celdas.
   vaciarTablero();
   for (let i = 0; i < 2; i++) {
      generarCelda();
   }
}

function cargarAnteriorJuego() {
   if (localStorage.getItem("anteriorJuego") !== null) {
      document.getElementById("tablero").innerHTML =
         localStorage.getItem("anteriorJuego");
      puntos = +localStorage.getItem("puntos");
      setPuntos();
   } else {
      iniciarJuego();
   }
}

function vaciarTablero() {
   for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
         // Reset de todas las celdas del tablero.
         resetCelda(document.getElementById("x" + x + "y" + y));
      }
   }
   // Establece los puntos a 0.
   puntos = 0;
   setPuntos();
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

   // Comprobamos si existe alguna fusión disponible.
   for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
         if (
            document.getElementById("x" + (x + 1) + "y" + y) != null &&
            document.getElementById("x" + x + "y" + y).innerText ==
               document.getElementById("x" + (x + 1) + "y" + y).innerText
         ) {
            return false;
         }
         if (
            document.getElementById("x" + (x - 1) + "y" + y) != null &&
            document.getElementById("x" + x + "y" + y).innerText ==
               document.getElementById("x" + (x - 1) + "y" + y).innerText
         ) {
            return false;
         }
         if (
            document.getElementById("x" + x + "y" + (y + 1)) != null &&
            document.getElementById("x" + x + "y" + y).innerText ==
               document.getElementById("x" + x + "y" + (y + 1)).innerText
         ) {
            return false;
         }
         if (
            document.getElementById("x" + x + "y" + (y - 1)) != null &&
            document.getElementById("x" + x + "y" + y).innerText ==
               document.getElementById("x" + x + "y" + (y - 1)).innerText
         ) {
            return false;
         }
      }
   }

   showModal("Derrota");
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

         // Elimina la animación.
         setTimeout(
            () => celda.classList.remove("generar-celda-animacion"),
            250
         );
         return;
      }
   } while (true);
}

function resetCelda(celda) {
   celda.className = "celda";
   celda.innerText = "";
}

/*
 *  celda     ->  Celda que se mueve.
 *  posicion  ->  Posicion a la que se mueve.
 *  dir       ->  Dirección a la que se mueve ("up", "right", "down", "left").
 *  mov       ->  Numero de celdas que se mueve.
 */
function moverCelda(celda, posicion, dir, mov) {
   // Inserta los datos la celda que se mueve en la celda vacía.
   posicion.innerText = celda.innerText;
   posicion.classList.add(
      "mover-" + mov + "-" + dir + "-animacion",
      "celda-" + celda.innerText
   );

   // Elimina la animación. SI NO HAGO ESTO Y LUEGO SE AÑADE LA MISMA ANIMACIÓN EL NAVEGADOR NO LA EJECUTA.
   setTimeout(
      () =>
         posicion.classList.remove("mover-" + mov + "-" + dir + "-animacion"),
      120
   );

   // Reset de la celda que deja libre.
   resetCelda(celda);
}

function fusionarCeldas(celda, posicion, mov) {
   // PREVENCIÓN DE ERROR. Si la celda con la que se esta comparando tiene la siguiente clase.
   // Significa que esta en proceso de fusión con otra.
   if (posicion.classList.contains("move-" + mov + "-to-fusion-animacion")) {
      return;
   }

   // Valor de la celda resultante.
   const valor = celda.innerText * 2;

   // Movimiento de la celda antes de resetearla.
   celda.classList.add("move-" + mov + "-to-fusion-animacion");

   // Reset de la celda que deja libre.
   setTimeout(() => resetCelda(celda), 60);

   // Fusiona ambas celdas.
   posicion.innerText = valor;
   posicion.className = "";
   posicion.classList.add("fusion-celda-animacion", "celda", "celda-" + valor);

   // Elimina la animación.
   setTimeout(() => posicion.classList.remove("fusion-celda-animacion"), 250);

   // Actualiza la puntuación.
   puntos += valor;
   setPuntos();
}

/***************************************************************************************/
/************************************* MOVIMIENTOS *************************************/
/***************************************************************************************/

/**********************
 * EXPLICACION ALGORITMO DE MOVIMIENTO.
 **********************
 * POR CADA MOVIMIENTO:
 * 1 -> Movemos las celdas todo lo posible en la direccion seleccionada, para evitar los espacios en blanco.
 *    1a -> Calculamos las celdas que se ha movido para visualizar una animación según cuanto se desplaza.
 *    1b -> Si ha habido movimiento, generamos una espera para que terminen las animaciones y no las termine abruptamente la parte 2.
 * 2 -> Fusionamos todas las celdas que permita el movimiento.
 *    2a -> Si ha habido fusión, generamos una espera para que terminen las animaciones.
 * 3 -> Se moverán las celdas en la direccion seleccionada para eliminar los espacios en blanco que genera la fusión.
 * 4 -> Se generará una celda nueva, si ha sido un movimiento válido.
 * 5 -> Si el movimiento no fue válido se comprobará si existe algún movimiento posible. En caso de no haber se mostrará la pantalla de derrota.
 **********************/

async function moveUp() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.
   let fusion = false; // Booleano para añadir tiempo de espera si ha habido animación de fusión.

   /*** *** PRIMERA BARRIDA DE MOVIMIENTO. *** ***/
   for (let y = 1; y <= 3; y++) {
      for (let x = 0; x < 4; x++) {
         const celda = document.getElementById("x" + x + "y" + y);

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Cuenta las celdas vacías directamente seguidas de la celda.
         let mov = 0;
         for (let i = y - 1; i >= 0; i--) {
            const celdaUp = document.getElementById("x" + x + "y" + i);
            // Termina el bucle en cuanto no encuentre una celda vacía.
            if (celdaUp.innerText != "" && celdaUp.innerText != null) {
               break;
            }

            // Aumenta el contador por cada celda vacía que encuentre.
            if (celdaUp.innerText == "" || celdaUp.innerText == null) {
               mov++;
            }
         }

         // Mueve CELDA cuando no ecuentre mas celdas vacías.
         if (mov != 0) {
            moverCelda(
               celda,
               document.getElementById("x" + x + "y" + (y - mov)),
               "up",
               mov
            );
            movimientoValido = true;
         }
      }
   }
   // Genera una espera para terminar las animaciones de movimiento. Si ha habido movimiento.
   if (movimientoValido) {
      await new Promise((resolve) => setTimeout(resolve, 125));
   }

   /*** *** FUSION DE CELDAS. *** ***/
   for (let y = 1; y <= 3; y++) {
      for (let x = 0; x < 4; x++) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaUp = document.getElementById("x" + x + "y" + (y - 1));

         // IMPORTANTE para evitar fusion de nulos. Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda actual y la celda inferior tienen el mismo valor, se fusionan las celdas.
         if (celda.innerText == celdaUp.innerText) {
            fusionarCeldas(celda, celdaUp, "up");
            movimientoValido = true;
            fusion = true;
         }
      }
   }
   // Espera para terminar animaciones de fusion.
   if (fusion) {
      await new Promise((resolve) => setTimeout(resolve, 65));
   }

   /*** *** SEGUNDA BARRIDA DE MOVIMIENTO. *** ***/
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
            moverCelda(celda, celdaUp, "up", 1);
            movimientoValido = true;
         }
      }
   }

   /*** *** GENERAR CELDA. *** ***/
   if (movimientoValido) {
      generarCelda();
   } else {
      comprobarDerrota();
   }
}

async function moveRight() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.
   let fusion = false; // Booleano para añadir tiempo de espera si ha habido animación de fusión.

   /*** *** PRIMERA BARRIDA DE MOVIMIENTO. *** ***/
   for (let y = 0; y < 4; y++) {
      for (let x = 2; x >= 0; x--) {
         const celda = document.getElementById("x" + x + "y" + y);

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Cuenta las celdas vacías directamente seguidas de la celda.
         let mov = 0;
         for (let i = x + 1; i < 4; i++) {
            const celdaRight = document.getElementById("x" + i + "y" + y);
            // Termina el bucle en cuanto no encuentre una celda vacía.
            if (celdaRight.innerText != "" && celdaRight.innerText != null) {
               break;
            }

            // Aumenta el contador por cada celda vacía que encuentre.
            if (celdaRight.innerText == "" || celdaRight.innerText == null) {
               mov++;
            }
         }

         // Mueve CELDA cuando no ecuentre mas celdas vacías.
         if (mov != 0) {
            moverCelda(
               celda,
               document.getElementById("x" + (x + mov) + "y" + y),
               "right",
               mov
            );
            movimientoValido = true;
         }
      }
   }
   // Genera una espera para terminar las animaciones de movimiento. Si ha habido movimiento.
   if (movimientoValido) {
      await new Promise((resolve) => setTimeout(resolve, 125));
   }

   /*** *** FUSION DE CELDAS. *** ***/
   for (let y = 0; y < 4; y++) {
      for (let x = 2; x >= 0; x--) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaRight = document.getElementById("x" + (x + 1) + "y" + y);

         // IMPORTANTE para evitar fusion de nulos. Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda actual y la celda inferior tienen el mismo valor, se fusionan las celdas.
         if (celda.innerText == celdaRight.innerText) {
            fusionarCeldas(celda, celdaRight, "right");
            movimientoValido = true;
            fusion = true;
         }
      }
   }
   // Espera para terminar animaciones de fusion.
   if (fusion) {
      await new Promise((resolve) => setTimeout(resolve, 65));
   }

   /*** *** SEGUNDA BARRIDA DE MOVIMIENTO. *** ***/
   for (let y = 0; y < 4; y++) {
      for (let x = 2; x >= 0; x--) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaRight = document.getElementById("x" + (x + 1) + "y" + y);

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
         if (celdaRight.innerText == "" || celdaRight.innerText == null) {
            moverCelda(celda, celdaRight, "right", 1);
            movimientoValido = true;
         }
      }
   }

   // GENERAR CELDA
   if (movimientoValido) {
      generarCelda();
   } else {
      comprobarDerrota();
   }
}

async function moveDown() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.
   let fusion = false; // Booleano para añadir tiempo de espera si ha habido animación de fusión.

   /*** *** PRIMERA BARRIDA DE MOVIMIENTO. *** ***/
   for (let y = 2; y >= 0; y--) {
      for (let x = 0; x < 4; x++) {
         const celda = document.getElementById("x" + x + "y" + y);

         // Si la celda esta vacia pasa a la siguiente celda.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Cuenta las celdas vacías directamente seguidas de la celda.
         let mov = 0;
         for (let i = y + 1; i < 4; i++) {
            const celdaDown = document.getElementById("x" + x + "y" + i);
            // Termina el bucle en cuanto no encuentre una celda vacía.
            if (celdaDown.innerText != "" && celdaDown.innerText != null) {
               break;
            }

            // Aumenta el contador por cada celda vacía que encuentre.
            if (celdaDown.innerText == "" || celdaDown.innerText == null) {
               mov++;
            }
         }

         // Mueve la celda cuando no ecuentre mas celdas vacías.
         if (mov != 0) {
            moverCelda(
               celda,
               document.getElementById("x" + x + "y" + (y + mov)),
               "down",
               mov
            );
            movimientoValido = true;
         }
      }
   }
   // Genera una espera para terminar las animaciones de movimiento. Si ha habido movimiento.
   if (movimientoValido) {
      await new Promise((resolve) => setTimeout(resolve, 125));
   }

   /*** *** FUSION DE CELDAS. *** ***/
   for (let y = 2; y >= 0; y--) {
      for (let x = 0; x < 4; x++) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaDown = document.getElementById("x" + x + "y" + (y + 1));

         // IMPORTANTE para evitar fusion de nulos. Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda actual y la celda inferior tienen el mismo valor, se fusionan las celdas.
         if (celda.innerText == celdaDown.innerText) {
            fusionarCeldas(celda, celdaDown, "down");
            movimientoValido = true;
            fusion = true;
         }
      }
   }
   // Espera para terminar animaciones de fusion.
   if (fusion) {
      await new Promise((resolve) => setTimeout(resolve, 65));
   }

   /*** *** SEGUNDA BARRIDA DE MOVIMIENTO. *** ***/
   for (let y = 2; y >= 0; y--) {
      for (let x = 0; x < 4; x++) {
         const celda = document.getElementById("x" + x + "y" + y);
         const celdaDown = document.getElementById("x" + x + "y" + (y + 1));

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Si la celda de abajo esta vacía. Movemos la celda actual a la posicion inferior.
         if (celdaDown.innerText == "" || celdaDown.innerText == null) {
            moverCelda(celda, celdaDown, "down", 1);
            movimientoValido = true;
         }
      }
   }

   /*** *** GENERAR CELDA. *** ***/
   if (movimientoValido) {
      generarCelda();
   } else {
      comprobarDerrota();
   }
}

async function moveLeft() {
   let movimientoValido = false; // No contará como movimiento si no ha habido ninguna fusión ni desplazamiento.
   let fusion = false; // Booleano para añadir tiempo de espera si ha habido animación de fusión.

   /*** *** PRIMERA BARRIDA DE MOVIMIENTO. *** ***/
   for (let y = 0; y < 4; y++) {
      for (let x = 1; x <= 3; x++) {
         const celda = document.getElementById("x" + x + "y" + y);

         // Si la celda esta vacia pasa al siguiente bucle.
         if (celda.innerText == "" || celda.innerText == null) {
            continue;
         }

         // Cuenta las celdas vacías directamente seguidas de la celda.
         let mov = 0;
         for (let i = x - 1; i >= 0; i--) {
            const celdaLeft = document.getElementById("x" + i + "y" + y);
            // Termina el bucle en cuanto no encuentre una celda vacía.
            if (celdaLeft.innerText != "" && celdaLeft.innerText != null) {
               break;
            }

            // Aumenta el contador por cada celda vacía que encuentre.
            if (celdaLeft.innerText == "" || celdaLeft.innerText == null) {
               mov++;
            }
         }

         // Mueve CELDA cuando no ecuentre mas celdas vacías.
         if (mov != 0) {
            moverCelda(
               celda,
               document.getElementById("x" + (x - mov) + "y" + y),
               "left",
               mov
            );
            movimientoValido = true;
         }
      }
   }
   // Genera una espera para terminar las animaciones de movimiento. Si ha habido movimiento.
   if (movimientoValido) {
      await new Promise((resolve) => setTimeout(resolve, 125));
   }

   /*** *** FUSION DE CELDAS. *** ***/
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
            fusionarCeldas(celda, celdaLeft, "left");
            movimientoValido = true;
            fusion = true;
         }
      }
   }
   /*** Espera para terminar animaciones de fusion. ***/
   if (fusion) {
      await new Promise((resolve) => setTimeout(resolve, 65));
   }

   /*** *** SEGUNDA BARRIDA DE MOVIMIENTO. *** ***/
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
            moverCelda(celda, celdaLeft, "left", 1);
            movimientoValido = true;
         }
      }
   }

   // GENERAR CELDA
   if (movimientoValido) {
      generarCelda();
   } else {
      comprobarDerrota();
   }
}

/* EVENTO LISTENER PARA CONTROLAR LOS MOVIMIENTOS POR TECLADO */
document.addEventListener("keydown", async function (event) {
   if (event.key == "ArrowUp") {
      await moveUp();
   }
   if (event.key == "ArrowRight") {
      await moveRight();
   }
   if (event.key == "ArrowDown") {
      await moveDown();
   }
   if (event.key == "ArrowLeft") {
      await moveLeft();
   }
   // Guarda en el localStorage tanto el tablero como los puntos.
   localStorage.setItem(
      "anteriorJuego",
      document.getElementById("tablero").innerHTML
   );
   localStorage.setItem("puntos", +puntos);
});
