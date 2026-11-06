# Les illes de la Nicole

Web táctil de aventuras matemáticas para Nicole, pensada sobre todo para el iPad. Especificación: [docs/Les_illes_de_la_Nicole_Diseno_para_Claude.md](docs/Les_illes_de_la_Nicole_Diseno_para_Claude.md).

**Estado: Fase B + niveles.** La misión «El berenar de la tripulació» está completa, con 10 niveles de cantidades. Publicada en https://mguitianl.github.io/les-illes/. Falta la prueba con Nicole: [docs/guion-observacion.md](docs/guion-observacion.md).

## Jugar en el iPad

Abre https://mguitianl.github.io/les-illes/ en Safari y usa Compartir → «Añadir a pantalla de inicio». Cada push a `main` en el repositorio `mguitianl/les-illes` pasa las pruebas y se publica solo (cuenta personal, no la de trabajo).

### Alternativa en la red local

1. En el Mac, abre el Terminal y ejecuta: `"/Users/miguel/IA casa/les-illes-de-la-nicole/eines/servir.sh"`. La primera vez, macOS puede preguntar si permite conexiones entrantes: acepta.
2. En el iPad, conectado a la misma wifi, abre en Safari la dirección que aparece (por ejemplo `http://192.168.1.88:8000/`).
3. Recomendado: Compartir → «Añadir a pantalla de inicio». Se abre a pantalla completa y Safari es menos propenso a borrar la partida.
4. El primer toque activa el sonido. El Mac debe seguir con la ventana del Terminal abierta mientras juega.

**Zona de adultos:** mantén pulsado 2 segundos el texto de arriba y pulsa los tres números que se indican en palabras.

## Para desarrollo

Requiere Node. Dentro de `app/`:

- `npm run dev`: servidor de desarrollo.
- `npm test`: pruebas de la lógica (cantidades, misión y guardado).
- `npm run build`, y luego `npm run e2e`: recorrido completo en Chromium y WebKit de escritorio. Antes hay que instalar los navegadores una vez con `npx playwright install webkit chromium`.
- `node eines/generar-audio.mjs`: regenera las locuciones provisionales a partir de `app/src/logica/textos.ts` y borra las que ya no se usan.
- `npm run build`, y luego `node proves/rendiment.mjs`: fluidez del arrastre con la CPU ralentizada (solo orientativa: no reproduce Safari).

Estructura de `app/src/`:

- `logica/`: funciones puras, sin dependencias de la interfaz.
  - `quantitats.ts`: motor de cantidades.
  - `textos.ts`: niveles y frases (sin dependencias; lo usa también el generador de audio).
  - `missio.ts`: pasos de la misión por nivel y transiciones.
  - `desat.ts`: guardado versionado.
- `audio/veu.ts`: locuciones.
- `ui/`: pantallas (puerto, merienda, barra de controles y zona de adultos).
- `art/sprite.ts`: ilustración SVG. `art/Dibuix.tsx` la muestra como imágenes para que el móvil no repinte los SVG con filtros.

`maqueta/` conserva la maqueta de la Fase A como referencia.

## Qué está hecho

- Los 7 pasos de la misión:
  1. Entrar desde el puerto.
  2. Recoger 3.
  3. Añadir 1.
  4. «¿Cuántas tenemos?»
  5. Entregar 2 de 4.
  6. «¿Cuántas quedan?»
  7. Elegir banderín.

  El banderín elegido aparece en el barco.
- 10 niveles con la misma secuencia y otras cantidades, siempre hasta 5 (ver `NIVELLS` en `textos.ts`). Al completar una misión se pasa al nivel siguiente; tras el décimo se vuelve al primero. El adulto puede elegir el nivel. Hay 6 banderines distintos para ganar.
- Las manzanas se mueven arrastrando o con toque y destino, y se pueden devolver. Un error al arrastrar no cuenta como fallo.
- Hay tres niveles de ayuda: señalar, contar juntos y demostración. Nunca restan premios.
- El resultado de cada operación (3 + 1, 4 − 2) no aparece hasta que Nicole responde.
- La partida se guarda tras cada movimiento. Se puede salir, recargar o girar el iPad y continuar.
- Zona de adultos con registro de cada paso y de la ayuda usada. Incluye las notas de observación, el ajuste de voz y los botones para reiniciar la misión o borrar todo.
- Si los datos guardados se dañan, la partida empieza de nuevo y se conserva una copia.

## Limitaciones reales

- **No se ha probado en un iPad ni en un iPhone reales.** Solo con Chromium y WebKit de escritorio en tamaño de iPad. Pendiente de comprobar en el iPad: audio tras el primer toque, arrastre con el dedo, pantalla de inicio, giro y vuelta desde segundo plano.
- **La voz es provisional:** síntesis Montse de macOS. Hay que decidir la definitiva antes de la prueba con Nicole.
- **Necesita internet:** no hay modo sin conexión. La voz de cada nivel se descarga al empezarlo.
- **El guardado está ligado a la dirección:** la web publicada y la del Mac son partidas distintas. Safari y el icono de inicio guardan por separado.
- **Progresión simple:** los niveles avanzan en orden al completar cada misión; todavía no se adaptan a las ayudas usadas (diseño §8) ni pasan de 5.
- **Fuera de esta fase:** sin efectos ni música, la misión de «nos falta una» y los demás juegos (memory, tablero, cartas).
