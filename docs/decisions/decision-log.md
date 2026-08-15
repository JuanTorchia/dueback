# Registro de decisiones

## D-001 — Repositorio como fuente común de verdad

- Fecha: 15 de agosto de 2026
- Estado: aceptada
- Decisión: Claude, ChatGPT/Codex y futuros asistentes compartirán contexto mediante archivos versionables del repositorio, no mediante historiales de chat aislados.
- Motivo: reducir contradicciones, conservar trazabilidad y permitir trabajo intercambiable.

## D-002 — Reservar la integración obligatoria de Google desde el diseño

- Fecha: 15 de agosto de 2026
- Estado: aceptada
- Decisión: todavía no se elige el modelo exacto ni el framework, pero la arquitectura incluirá desde el inicio los límites para Gemini 3.5+, un framework de agentes de Google y Google Cloud.
- Motivo: son requisitos eliminatorios y afectan diseño, despliegue y evidencia de la demo.

## D-003 — Participación sin organización incorporada

- Fecha: 15 de agosto de 2026
- Estado: aceptada
- Decisión: la persona participante reside en Argentina y no posee una empresa constituida. No se buscará el premio Startup Excellence.
- Motivo: Startup Excellence exige presentar el proyecto en nombre de una organización incorporada y proporcionar correo corporativo. Argentina no figura entre las jurisdicciones excluidas en las reglas publicadas.

## D-004 — Participación individual

- Fecha: 15 de agosto de 2026
- Estado: aceptada
- Decisión: se participará individualmente. La persona participante declara tener 36 años y residir en Argentina.
- Motivo: cumple el requisito de mayoría de edad y permite competir por Individual/Hobbyist además de los premios generales y por categoría.

## D-005 — Registro en Devpost completado

- Fecha: 15 de agosto de 2026
- Estado: aceptada
- Decisión: la cuenta del participante quedó registrada oficialmente en All Things Agentic Hackathon.
- Evidencia: Devpost mostró `Thanks for registering!` y habilitó la página de gestión de proyectos del hackathon.

## D-006 — Solicitud de créditos y dirección provisional

- Fecha: 15 de agosto de 2026
- Estado: aceptada
- Decisión: se solicitó el crédito promocional de USD 150 para la categoría `The Taskmaster`, describiendo DoneFlow como una capa de aseguramiento de resultados con `Proof of Done`, Gemini 3.5 Flash, Genkit y Google Cloud.
- Alcance: la categoría y el concepto pueden cambiar antes de la entrega; esta solicitud no sustituye la validación técnica del MVP.
- Evidencia: Google Forms confirmó `Your response has been recorded` e indicó hasta 72 horas hábiles de procesamiento. No se enviará otra solicitud salvo denegación.

## D-007 — Contrato de construcción preproducto

- Fecha: 15 de agosto de 2026
- Estado: aceptada para validación
- Decisión: DoneFlow se construirá primero como un runtime de aseguramiento de resultados. Purchase Rescue será el único vertical end-to-end; Bill Fixer y Deadline Guardian serán pruebas reducidas del mismo núcleo.
- Framework: Genkit con TypeScript, Gemini 3.5+ mediante Vertex AI, Cloud Run, Firestore y Cloud Tasks.
- Recorte: no se construirán marketplace, editor universal, acceso bancario, navegación general ni tres integraciones productivas completas.
- Motivo: auditoría independiente de producto, jurado y factibilidad coincidió en que `false DONE prevention`, durabilidad, permisos y evidencia son el diferenciador y la ruta de mayor factibilidad individual.
- Criterio de revisión: si Purchase Rescue no demuestra acción externa, reanudación y evidencia determinista con un schema reutilizable, se considerará RecallZero como wedge principal.

## D-008 — Producto inbox-first y canales

- Fecha: 15 de agosto de 2026
- Estado: aceptada para MVP
- Decisión: DoneFlow será `inbox-first, link-second`. Email forwarding será el canal P0 real y una carga web móvil será el fallback; la web se usará para consentimiento, excepciones y evidencia, no como dashboard cotidiano.
- Visión: arquitectura portable a WhatsApp, share sheet y otros canales mediante adapters normalizados.
- Recorte: WhatsApp no será dependencia crítica del hackathon; se documentará como siguiente canal por el riesgo de onboarding empresarial, reglas de mensajería y aprobación externa.
- Motivo: maximizar adopción y permitir `capturar y soltar` sin instalación ni configuración de workflows, conservando una demo reproducible para una persona desarrolladora.

## D-009 — DueBack, canal P0 y kill test ganador

- Fecha: 15 de agosto de 2026
- Estado: aceptada; sustituye D-008 para el alcance P0
- Decisión: DueBack es el producto visible y DoneFlow su runtime interno. La visión es `share-first`,
  pero el MVP es `upload/paste-first`; cargar o pegar contenido reenviado satisface el formato de
  entrada sin exigir transporte SMTP. Inbound email, WhatsApp y share sheet quedan fuera del kill
  test. Una notificación persistente y deduplicada sí pertenece al núcleo; email saliente se añade
  después del kill test si el proveedor es estable.
- Kill test: 15 resultados observables que prueban Gemini con provenance, aprobación limitada,
  Firestore durable, Cloud Tasks, acción HTTP idempotente, acknowledgement insuficiente, retry,
  callback firmado, verificador determinista, `MERCHANT_CONFIRMED`, timeline y logs en Cloud Run.
- Identidad: Firebase anonymous al activar, ownership por caso y aprobación ligada a owner, versión,
  hash y expiración. Los callbacks usan una frontera de autenticación separada.
- Motivo: tres auditorías independientes de jurado, producto y arquitectura coincidieron en que esta
  secuencia maximiza utilidad, disciplina arquitectónica y reproducibilidad para una persona sola.
  El backlog completo no es un requisito de las primeras 48 horas.

## Decisiones pendientes

- Confirmación de ausencia de sanciones o conflictos de interés.
- Validación del problema y usuario inicial de Purchase Rescue.
- Confirmación final de categoría oficial.
- Framework de agentes de Google.
- Servicios de Google Cloud.
- Premio objetivo principal.
