# Casandra Predict

Crea "Casandra": app de mercado de predicción académico, minimalista. Los alumnos apuestan tokens a que una pregunta "entra" o "no entra" en un examen.

Auth: login con Google. Saldo inicial: 10 tokens. Admin: jose.luefer (pestaña extra para resolver preguntas, vía la misma capa de datos aislada).

Estilo: fondo #f7f7f5, fuente Inter (JetBrains Mono para números). Feed centrado, max-width 520px, sin cards/sombras — solo separador horizontal fino entre preguntas.

Topbar fija: "Casandra" izq., saldo en píldora negra con icono de moneda amarilla, der.

Cada fila de pregunta:

Título izq. | número grande de probabilidad der. (ej. 79, sin "%" ni etiqueta) — verde si ≥50, rojo si <50

Mini gráfico de línea debajo del título: relleno degradado, variación visual amplificada respecto al primer valor, verde/rojo según tendencia, sin ejes/grid/marcadores, ancho completo, ~64px alto

2 botones iguales: SÍ (izq.) / NO (der.), blancos con borde gris hasta pulsar. Al pulsar: -1 saldo, botón se colorea (verde/rojo), añade un círculo amarillo apilado dentro (máx. 5 visibles), actualiza probabilidad+gráfico, reordena feed por prob. SÍ desc. Se puede tener tokens en ambos lados.

Si hay tokens apostados: botón "Retirar" ancho completo debajo — devuelve todo al saldo, revierte pool, resetea botones.

Botón flotante "+" (negro, circular, abajo-dcha): abre form con 1 campo (texto de pregunta). Nueva pregunta arranca en 50, sin historial.

Botón discreto al final del feed: "simular apuesta de otro alumno →" — añade 1-3 tokens random a un lado de una pregunta random, actualiza todo.

Arquitectura: toda la lógica de datos (apostar, retirar, crearPregunta, leerPreguntas, simular, resolver) en un único hook/archivo (ej. hooks/useMercado.js), separado de los componentes. Mock data en estado local ahora, pero con firmas de función listas para sustituir por llamadas a API real sin tocar UI. Ningún componente toca el estado directamente.

Stack: React (o HTML/CSS/JS), funcional de verdad, no solo visual.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2febc038-6209-429c-8c2a-c5c925899d2b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
