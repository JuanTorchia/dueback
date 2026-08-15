# Auditoría multiagente de DoneFlow

Fecha: 15 de agosto de 2026.

## Jurados simulados

1. Producto senior de Google Cloud/Gemini Enterprise Agent Platform.
2. Arquitectura y factibilidad técnica Devpost.
3. Investigación de producto para personas comunes, accesibilidad y adopción global.

## Veredicto

**GO condicionado y con recorte fuerte.**

DoneFlow tiene mayor techo que RecallZero, pero su formulación inicial corre alto riesgo de parecer:

- un clon pequeño de Zapier/IFTTT;
- un constructor no-code de agentes;
- un marketplace vacío;
- tres sandboxes presentados como integraciones universales;
- una arquitectura magnífica en papel sin producto ejecutable.

La parte defendible no es crear agentes ni distribuir recetas. Es el **Proof of Done**.

> Agent builders define what an agent can do. DoneFlow defines what it is allowed to finish—and what proof it must return.

## Posicionamiento recomendado

No usar como titular:

- “WordPress for agents”.
- “IFTTT with AI”.
- “Build any agent”.
- “Marketplace of agents”.

Usar:

> **DoneFlow handles life's unfinished tasks—and only marks them done when it can prove the result.**

Definición técnica:

> DoneFlow is an outcome-assurance layer for personal agents.

La visión futura puede incluir recetas y marketplace, pero el hackathon debe demostrar la primitiva de confianza.

## Lenguaje para personas

`Outcome Contract` permanece como nombre interno. En la interfaz se llama **Resolution Plan** / **Plan de resolución**.

La persona no configura triggers, policies ni fallbacks. Ve una tarjeta:

- **Haré:** acciones concretas.
- **Necesito:** datos y accesos mínimos.
- **Nunca haré:** límites explícitos.
- **Te preguntaré antes de:** decisiones sensibles.
- **Termina cuando:** evidencia exigida.
- **Caduca:** fecha o condición de abandono.

Acciones principales:

- `Try without acting` / Probar sin actuar.
- `Activate` / Activar.
- `Change limits` / Cambiar límites.
- `Stop` / Detener siempre visible.

Estados humanos:

- Trabajando.
- Necesita tu decisión.
- Resuelto, con prueba.

## Tres recetas recomendadas

### 1. Purchase Rescue — demo completa

> “Algo salió mal con una compra; resuélvelo.”

Acepta recibo, correo, foto o captura. Persigue entrega tardía, artículo incorrecto, devolución, reemplazo o reembolso.

`Proof of Done`: confirmación verificable de reembolso, reemplazo, entrega o resolución aceptada.

Prueba decisiva: Gemini interpreta “refund approved”, pero la evidencia solo dice “request received”. DoneFlow se niega a marcar `DONE`, continúa y cierra cuando llega confirmación con ID e importe.

### 2. Bill Fixer — prueba de reutilización

> “Este cobro o factura no parece correcto.”

Encuentra duplicados o diferencias frente a historial/contrato, reúne evidencia y prepara el reclamo. No declara fraude ni asesoramiento legal.

`Proof of Done`: corrección, crédito, devolución o respuesta final documentada y aceptada.

### 3. Deadline Guardian — prueba de duración

> “No dejes que pierda este plazo.”

Extrae fechas y requisitos desde documentos, fotos o correos; reúne lo necesario, prepara el siguiente paso y escala faltantes.

`Proof of Done`: confirmación de presentación, renovación o acción terminada. Un recordatorio no cuenta.

### Receta técnica adicional

RecallZero queda como fixture/prueba adversarial en el repositorio para eventos físicos, imagen e inputs hostiles. No necesita ocupar tiempo central del video si amenaza la claridad.

## Alcance construible por una persona

### Sí

- Schema real de Outcome Contract.
- Plan de resolución legible y aprobado.
- Runtime durable con estados explícitos.
- Action Broker cerrado.
- Purchase Rescue completo contra Merchant Sandbox rotulado.
- Bill Fixer y Deadline Guardian como recetas funcionales reducidas sobre el mismo motor.
- Persistencia, retry, idempotencia y evidencia.
- Timeline del usuario y logs correlacionados.
- Despliegue en Google Cloud.

### No

- Marketplace comercial.
- Editor visual universal.
- Integraciones arbitrarias.
- Reembolsos reales con cualquier comercio.
- Automatización de trámites en cualquier país.
- Tres integraciones externas productivas completas.
- Flota multiagente innecesaria.

## Stack mínimo recomendado

- TypeScript.
- Next.js para UI/API.
- Genkit como framework de Google.
- Gemini 3.5 mediante Vertex AI.
- Cloud Run.
- Firestore.
- Cloud Tasks para reintentos/callbacks.
- Structured Logging con `run_id`.
- Cloud Storage solo si las imágenes lo requieren.

No añadir Pub/Sub junto con Cloud Tasks si no existe una necesidad demostrable.

## Estados

```text
DRAFT
→ AWAITING_APPROVAL
→ RUNNING
→ WAITING_EXTERNAL
→ NEEDS_ATTENTION
→ DONE

Cualquier estado activo → FAILED | EXPIRED
```

Solo el policy engine cambia estados. Gemini propone interpretación o acción; nunca se autoriza, ejecuta herramientas directamente ni declara `DONE`.

## Qué será real

- Llamadas a Gemini.
- Genkit y tools.
- Cloud Run, Firestore y Cloud Tasks.
- Persistencia y reanudación.
- Action Broker e idempotencia.
- Aprobaciones.
- Evidencia y verificación determinista.
- Timeline y logs.

## Qué puede ser sandbox/fixture, siempre rotulado

- Comercio y webhook de Purchase Rescue.
- Proveedor de facturación.
- Endpoint de renovación/plazo.
- Emails de confirmación.
- Fallos inducidos.

No se afirmará compatibilidad global ni integración comercial real.

## Tests obligatorios

- Contrato inválido no se activa.
- Acción fuera de límites se rechaza.
- Gemini no amplía permisos.
- Evidencia incompleta no produce `DONE`.
- Transición ilegal se rechaza.
- `PENDING → retry → APPROVED` conserva una sola solicitud.
- Dos callbacks iguales no duplican acciones.
- Reinicio de worker conserva estado.
- Webhook sin firma se rechaza.
- Evidencia con `run_id` incorrecto se rechaza.
- Texto hostil dentro de un recibo no modifica herramientas ni políticas.

## Guion recomendado

- 0:00–0:25: problema y promesa Proof of Done.
- 0:25–0:45: Plan de resolución y límites.
- 0:45–2:25: Purchase Rescue, fallo, retry y callback.
- 2:25–2:50: rechazo del falso `DONE`, evidencia final y timeline.
- 2:50–3:20: Bill Fixer y Deadline Guardian generan el mismo contrato/runtime.
- 3:20–3:45: Cloud Run, Firestore, Cloud Tasks y logs correlacionados.
- 3:45–4:00: “Done means verified evidence, not generated text.”

## Puntuaciones estimadas

| Jurado            |     Actual sin producto | Techo con MVP |
| ----------------- | ----------------------: | ------------: |
| Google Cloud      |                  2.71/5 |        4.67/5 |
| Técnico Devpost   |            Stage 1 fail |        4.27/5 |
| Personas/adopción | 3.0–4.3 según dimensión |       4.1–4.8 |

## Condición de abandono

En los primeros días debe funcionar una secuencia mínima:

1. Recibo no estructurado.
2. Plan de resolución aprobado.
3. Acción idempotente al Merchant Sandbox.
4. Respuesta `PENDING`.
5. Fallo/reinicio.
6. Callback verificable.
7. Rechazo de evidencia insuficiente.
8. `DONE` únicamente con evidencia válida.

Si esa secuencia no se implementa limpiamente, DoneFlow se abandona como producto principal y se vuelve al vertical RecallZero.

## Texto recomendado para créditos

**The Taskmaster**

> DoneFlow is an outcome-assurance layer for personal agents: users approve a clear Resolution Plan defining permissions, boundaries, and the evidence required to call a real-life task complete, and the agent keeps working across failures and delays until that evidence exists. Gemini interprets multimodal intent and changing information, while Google Genkit and Google Cloud provide durable execution, controlled actions, recovery, and an auditable Proof of Done.
