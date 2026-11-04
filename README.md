# StereoVision Studio 3D

**Nombre:** Jocelin Ramírez  
**Número de control:** 21200662  
**Materia:** Desarrollo de Soluciones en Ambientes Virtuales

Aplicación web educativa para importar desde el dispositivo y visualizar imágenes anaglifo rojo-cian, imágenes Side-by-Side (SBS) y video SBS. Atiende a estudiantes que necesitan explorar, explicar y calibrar material estereoscópico en escritorio o con un teléfono y visor tipo Cardboard.

## Qué resuelve y alcance

El anaglifo combina las vistas estereoscópicas en canales de color y se observa con lentes rojo-cian. El módulo puede generarlo desde una imagen SBS: toma el canal rojo de la vista izquierda y los canales verde y azul de la vista derecha. También puede abrir un anaglifo ya preparado. SBS conserva las dos perspectivas lado a lado: la mitad izquierda corresponde al ojo izquierdo y la mitad derecha al derecho (salvo que se intercambien). Una imagen 2D común no contiene dos perspectivas y no puede producir profundidad real por sí sola.

El Studio permite abrir archivos locales, comprobar que el navegador los decodifique, ajustar la representación en pantalla y reproducir video SBS. Los originales no se modifican y los archivos no salen del dispositivo. No incluye cuentas, servidor, almacenamiento, detección automática de pares estereoscópicos, creación de profundidad desde imágenes 2D, transcodificación ni exportación. El modo Viewer divide la pantalla en dos vistas para gafas móviles; no es seguimiento de cabeza ni WebXR.

## Estructura y módulos

- `index.html`: estructura semántica e interfaz inicial.
- `assets/css/styles.css`: diseño adaptable, visor y estilos de presentación.
- `assets/js/main.js`: inicialización, eventos y coordinación del estado.
- `assets/js/modules/state.js`: estados y valores predeterminados.
- `assets/js/modules/files.js`: validación de tipo, decodificación y liberación de recursos locales.
- `assets/js/modules/viewers.js`: presentación anaglifo/SBS y controles sincronizados del video.
- `assets/js/modules/anaglyph.js`: conversión de imágenes SBS a anaglifo rojo-cian mediante mezcla de canales.
- `assets/js/modules/controls.js`: controles de calibración, actualización de vista y restablecimiento.

El estado de uso recorre: sin archivo → preparación → listo; el video puede pasar a reproduciendo o pausado; las fallas se muestran en el Studio y permiten seleccionar otro archivo. Al cambiar módulo o archivo se pausa y libera el contenido anterior, se revoca su URL temporal y se restauran los ajustes.

## Uso local y publicación

Sirve el directorio raíz mediante HTTP, por ejemplo con la extensión Live Server de VS Code o `python -m http.server 8000`, y abre `http://localhost:8000`. No abras `index.html` como `file://`: el proyecto usa módulos ES.

Para GitHub Pages, publica la rama y carpeta que contiene `index.html` (por ejemplo, `main` / `/ (root)`) en la configuración Pages del repositorio. La aplicación es estática y las rutas son relativas, por lo que funciona bajo HTTPS y en una ruta de proyecto.

## Material recomendado

Prepara una imagen SBS con dos perspectivas diferentes para generar el anaglifo, una imagen SBS para comprobar el visor y un MP4 SBS H.264/AAC probado en el navegador del teléfono de evaluación. También puedes cargar un anaglifo rojo-cian ya procesado. El programa comprueba extensión/tipo y decodificación, pero no puede determinar si el archivo contiene profundidad real. Video 2D duplicado en ambas mitades seguirá siendo plano.

## Matriz de verificación y evidencias

Registra fecha, navegador, dispositivo, nombre del archivo y resultado observado en cada prueba. No se presentan resultados ficticios: completa observaciones e incidencias durante las pruebas con tus archivos y equipo.

| ID | Verificación | Resultado / evidencia |
|---|---|---|
| P-01 | Inicio sin contenido y controles inactivos | Por completar en el navegador |
| P-02 | Anaglifo: cargar, escala, brillo, contraste y restablecer | Por completar con lentes rojo-cian |
| P-03 | Imagen SBS: vistas, desplazamiento, escala e intercambio | Por completar con material SBS real |
| P-04 | Video SBS: reproducir, pausar, buscar, volumen y tiempos | Por completar en navegador de escritorio y móvil |
| P-05 | Ajustes del video mientras reproduce | Por completar |
| P-06 | Sustituir contenido y alternar módulos sin recargar | Por completar |
| P-07 | Archivo inválido y recuperación con otro archivo | Por completar |
| P-08 | Viewer móvil horizontal, ajustes y salida | Por completar con gafas/Cardboard |
| P-09 | Publicación HTTPS en GitHub Pages y rutas | Por completar tras publicar |

**Registro de calibración:** añade aquí los valores usados, dispositivo y resultado visual para cada uno de los tres materiales de prueba. Registra al menos dos incidencias reales y la solución aplicada. Detén la observación si aparece mareo, fatiga ocular o visión doble persistente.
