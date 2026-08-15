# Auditoría multiagente de la propuesta

Fecha: 15 de agosto de 2026.

Se simularon tres jurados independientes:

1. Jurado senior de producto Google Cloud.
2. Jurado técnico Devpost con poco tiempo de revisión.
3. Jurado contrarian de innovación, impacto y UX.

Ninguno editó la propuesta y cada uno evaluó de forma independiente.

## Consenso

RecallGuard doméstico **no es todavía una apuesta ganadora**.

Fortalezas compartidas:

- problema real de seguridad;
- excelente demo multimodal;
- flujo natural de eventos, estado y acciones;
- posibilidad de mostrar seguridad, recuperación y auditoría;
- alcance viable si se recorta correctamente.

Debilidades compartidas:

- inventario + fotos + alertas de recall ya existe en productos comerciales;
- frecuencia muy baja para un hogar individual;
- Gemini puede parecer OCR y matching reemplazable;
- ADK puede parecer decorativo en un pipeline lineal;
- la reparación depende de fabricantes sin APIs uniformes;
- una fuente simulada o acción controlada puede parecer teatro de demo;
- foco inicial en Estados Unidos no ofrece una historia natural para un participante argentino;
- el proyecto todavía solo existe como documentación y actualmente fallaría Stage 1.

## Competencia encontrada

La investigación posterior confirmó productos que ya combinan inventario, captura por foto/recibo y alertas:

- ProofShelf: https://proofshelf.app/
- kept: https://getkeptapp.com/
- Dwelco AI: https://www.dwelco.ai/
- ReceiptCash: https://www.receiptcash.com/
- Stuff: https://www.stuff.inc/

Conclusión: `foto → inventario → alerta` es una función existente, no el ángulo diferenciador.

## Veredictos resumidos

| Jurado                |         RecallGuard doméstico | Recomendación                                                                    |
| --------------------- | ----------------------------: | -------------------------------------------------------------------------------- |
| Producto Google Cloud |       3.0/5 actual; techo 4.4 | Reposicionar a operaciones multi-sede en organizaciones comunitarias.            |
| Técnico Devpost       | 3.98/5 si se ejecuta muy bien | Probar cierre con evidencia y seguridad frente a entradas hostiles.              |
| Impacto/UX contrarian |                         3.5/5 | Proteger al siguiente propietario de artículos usados, especialmente infantiles. |

## Dos características imprescindibles

### Recall Firewall

Los avisos, PDFs, correos y páginas externas se consideran hostiles. El agente:

- acepta solo procedencia autorizada;
- separa extracción sin privilegios de herramientas de acción;
- valida esquemas y campos críticos con reglas deterministas;
- bloquea prompt injection, tool poisoning y solicitudes de exfiltración;
- registra por qué autorizó o rechazó cada acción.

### Proof-of-Resolution Ledger

Un caso nunca se marca como resuelto porque se envió un correo. Solo avanza mediante evidencia:

- identificador de ticket;
- etiqueta o constancia de devolución;
- foto de cuarentena/destrucción;
- confirmación de reparación/reemplazo;
- firma o escaneo del responsable autorizado.

La métrica correcta es `verified containment/resolution rate`, no cantidad de alertas enviadas.

## Concepto fusionado recomendado

# SecondLife Safety

**Autonomous recall containment for products without an original buyer.**

Un agente para centros de donaciones, tiendas solidarias, refugios, guarderías y redes comunitarias que impide que productos usados retirados lleguen a otra familia.

> **Estado posterior:** la segunda auditoría detectó que este alcance mezcla organizaciones con políticas incompatibles. Consultar `second-jury-audit.md`. El concepto refinado para validar es **RecallZero**, inicialmente para herramientas eléctricas usadas en una high-risk intake lane.

### Por qué es más único

- Los sistemas de recall intentan contactar al comprador original; los productos usados, donados, heredados o importados rompen esa cadena.
- No existen recibos fiables: Gemini debe interpretar el objeto real, etiquetas deterioradas, logos, geometría, manuales y números parciales.
- Una organización recibe suficiente volumen para que el problema sea frecuente.
- Artículos para bebés y niños aportan impacto emocional sin hacer diagnóstico médico.
- La acción puede completarse dentro de la organización: aceptar, bloquear, poner en cuarentena, escalar y documentar disposición.
- El resultado no depende de una API del fabricante para ser verificable.
- Varias sedes justifican estado durable, identidad, permisos, eventos y auditoría.

### Flujo de punta a punta

1. Un voluntario fotografía un artículo donado o escanea una caja/lote.
2. Gemini extrae identidad y evidencia; si falta un dato crítico pide una foto específica.
3. El agente contrasta fuentes oficiales y políticas de la organización.
4. Recall Firewall bloquea avisos falsificados e instrucciones no confiables.
5. El sistema acepta, retiene o pone en cuarentena el artículo.
6. Si un recall aparece después, encuentra todas las unidades y sedes afectadas.
7. Asigna tareas con permisos mínimos y plazos.
8. Reintenta, escala sedes sin respuesta y evita tareas duplicadas.
9. Cierra solo cuando recibe evidencia verificable de contención/disposición.
10. Produce un informe auditable por artículo, lote, sede y responsable.

### Frase de apertura

> Every recall system tries to reach the original buyer. SecondLife Safety protects the next family.

### Promesa operacional

> From recall notice to zero unsafe donations.

## Encaje con premios

- **The Taskmaster:** flujo completo desde inspección hasta contención verificada.
- **Individual/Hobbyist:** alcance vertical ejecutado por un participante individual.
- **Best Architectural Design:** aislamiento de herramientas, políticas, idempotencia y auditoría.
- **Best Multimodal UX:** fotografía guiada y evidencia visual.
- **Grand Prize:** impacto social, narrativa memorable y demostración completa del stack.

Cada proyecto solo puede recibir un premio, pero puede ser evaluado para esas distinciones.

## Demo que los jurados premiarían

1. Un artículo infantil usado llega sin recibo y con etiqueta deteriorada.
2. Gemini identifica el candidato y pide exactamente la foto faltante.
3. Un evento basado en un recall oficial real activa la revisión.
4. Un aviso falsificado intenta obtener datos y Recall Firewall lo bloquea.
5. El agente crea cuarentena por sede; una acción falla y se reanuda sin duplicarse.
6. Un responsable aporta evidencia visual.
7. El tablero termina en `100% contained`, con timeline, Cloud logs y reporte auditable.

## Riesgos pendientes

- Validar que organizaciones comunitarias realmente reciben productos de categorías relevantes.
- Elegir una única clase de producto y una fuente oficial para el MVP.
- No afirmar identificación exacta cuando la evidencia es insuficiente.
- Etiquetar los replays y sandboxes con total transparencia.
- Definir si la organización objetivo acepta artículos infantiles; algunas los rechazan por política.
- Evitar sobrearquitectura multiagente: usar agentes separados solo donde existan permisos o responsabilidades distintas.
