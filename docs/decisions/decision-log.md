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

## D-010 — Plugin vigente de Genkit para Vertex AI

- Fecha: 15 de agosto de 2026
- Estado: aceptada; precisa D-007 sin cambiar el framework ni el proveedor
- Decisión: usar Genkit 1.41 con `@genkit-ai/google-genai` y su inicializador `vertexAI()` para
  invocar `gemini-3.5-flash` mediante Vertex AI y Application Default Credentials.
- Motivo: la documentación oficial actual de Genkit marca como deprecado el export principal para
  Gemini de `@genkit-ai/vertexai` y recomienda el plugin unificado. Continuar con el paquete antiguo
  introduciría deuda y una señal técnica negativa evitable.
- Fuente: https://genkit.dev/docs/js/integrations/vertex-ai/

## D-011 — Walking skeleton desplegado supera el kill test

- Fecha: 15 de agosto de 2026
- Estado: aceptada
- Decisión: continuar con DueBack después de demostrar el flujo P0 en Cloud Run, Firestore,
  Cloud Tasks y Vertex AI. El caso desplegado `case_45346841-8e3d-4d1f-9f48-7ea606384716`
  avanzó de `READY` a `WAITING_EXTERNAL` y `DONE` sin mantener la pestaña activa.
- Evidencia observada: Gemini 3.5 Flash extrajo la promesa; el sandbox HTTP emitió un
  `REQUEST_ACKNOWLEDGED` firmado que el verificador rechazó por `INSUFFICIENT_LEVEL`; luego emitió
  `MERCHANT_CONFIRMED`, que fue aceptado. Firestore registró versión final 4, cero `lastError` y una
  notificación `CASE_COMPLETED` deduplicada.
- Despliegue: revisiones `dueback-web-00009-5jz` y `dueback-merchant-sandbox-00004-lht`, con
  imágenes construidas por Cloud Build. El sandbox está rotulado como servicio controlado y no se
  presenta como comercio real.
- Motivo: cumple el gate técnico para continuar a excepciones, portabilidad y evaluación sin
  inventar una integración comercial productiva.

## D-012 — Los índices de lectura forman parte del despliegue

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: declarar y provisionar el índice compuesto de Firestore para
  `interventions(caseId, createdAt)` como parte de la infraestructura reproducible.
- Evidencia: la primera verificación Playwright móvil alcanzó la pantalla de resultado desplegada y
  expuso `FAILED_PRECONDITION` antes de que existiera el índice. El fallo se conservó, el índice se
  añadió a `infra/firestore/firestore.indexes.json` y el script de Cloud Run ahora lo crea si falta.
- Motivo: una consulta que funciona solo después de una acción manual en consola no satisface el
  criterio de reproducibilidad ni la preparación para producción.

## Decisiones pendientes

- Confirmación de ausencia de sanciones o conflictos de interés.
- Ejecución de la validación no asistida con ocho participantes.
- URL pública del repositorio, video y envío final en Devpost.

## D-013 — CPU explícita para callbacks del sandbox controlado

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: desplegar el Merchant Sandbox con CPU no limitada mientras la instancia está activa.
  El sandbox devuelve HTTP 202 y emite callbacks firmados con demoras acotadas; esa tarea posterior
  a la respuesta no puede depender de la asignación de CPU por solicitud.
- Evidencia: la primera repetición doble contra `dueback-web-00014-pzv` dejó un caso en
  `WAITING_EXTERNAL`: existían plan y recibo de acción, pero no evidencia ni callback. Cloud Run
  mostraba el 202 del sandbox y ninguna solicitud posterior. Con
  `run.googleapis.com/cpu-throttling: false`, dos recorridos nuevos pasaron sin retries y ambos
  produjeron el ledger completo de cuatro eventos.
- Alcance: esta decisión hace reproducible el servicio controlado de demostración; no convierte el
  sandbox en una integración comercial ni prueba liquidación bancaria.

## D-014 — Informes sintéticos como piloto, nunca como evidencia humana

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: los ocho archivos de `user-testing-feedback/` no se incorporan al CSV ni a las métricas
  SC-001/SC-002 porque su propio README declara personas, citas y tiempos sintéticos. Se utilizan
  únicamente para formular hipótesis de bugs que deben confirmarse contra código o ejecución.
- Resultado: se confirmaron y corrigieron el presupuesto global por contenido, la carrera de
  identidad, los campos bloqueantes sin editor, la incertidumbre invisible y la ausencia de
  privacidad/borrado preactivación. El estudio humano sigue pendiente.
- Motivo: presentar simulaciones de IA como ocho participantes violaría la regla de no inventar
  métricas y dañaría la credibilidad del proyecto ante el jurado.

## D-015 — Panel de personas sintéticas con verificación reproducible

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: usar agentes con historias divergentes únicamente como auditoría heurística. Cada
  hallazgo debe etiquetarse como reproducción, inspección o predicción y solo puede impulsar código
  si se confirma contra la aplicación o el repositorio.
- Cambios aceptados: separar fecha prometida de fecha de seguimiento, advertir sandbox antes del
  permiso, limitar el claim final, conservar solo citas textuales verificadas, anunciar cambios a
  tecnología asistiva, simplificar timeline y mejorar reflow/táctil móvil.
- Exclusión: el panel no produce usuarios, preferencias, citas, tiempos ni tasas y no satisface el
  estudio de ocho adultos.

## D-016 — La extracción debe convertirse en trabajo durable

- Fecha: 16 de agosto de 2026
- Estado: aceptada para la siguiente iteración
- Evidencia: auditores sintéticos midieron entre 17 y 25 segundos percibidos para llegar a revisión;
  el código mantiene abierto `POST /api/intake` durante la llamada Gemini y hasta dos intentos.
- Decisión inmediata: mostrar espera honesta con tiempo observado, estados de demora, contenido
  preservado, errores accionables y pruebas browser deterministas de demora/fallo y fuente combinada.
- Decisión estructural: reemplazar el request largo por creación rápida de un caso `ANALYZING`,
  procesamiento idempotente mediante Cloud Tasks y una ruta de progreso reanudable. Las etapas de UI
  deberán provenir de estado persistido real, no de animaciones que simulen avance.
- Motivo: reduce abandono y convierte la latencia de Gemini en una demostración visible de ejecución
  durable para la categoría Taskmaster.

## D-017 — Plataforma global, una receta real primero

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: posicionar DueBack como runtime de `Proof of Done` para resultados pendientes, no como
  aplicación exclusiva de reembolsos. La interfaz explica el contrato universal —resultado,
  límites, acciones y evidencia— y muestra seguimiento a empresas como la única receta pública
  completamente ejecutable en el MVP.
- Extensiones: turnos y documentos se muestran como próximos adaptadores. No se presentan como
  integraciones productivas hasta que tengan una ruta real, errores, verificación y documentación.
- Motivo: conserva una demostración profunda y honesta para la rúbrica, mientras comunica que la
  misma máquina de estados puede servir a personas, equipos, países y clases de resultado distintas.

## D-018 — El canal y el regreso del resultado deben ser visibles

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: explicar el circuito de comunicación en intake, aprobación y resultado. La demo pública
  contacta únicamente al Merchant Sandbox mediante un adaptador HTTP controlado y firmado; ninguna
  empresa real recibe mensajes. El usuario observa el resultado en una página de caso que consulta
  el estado automáticamente mientras permanece abierta.
- Límite: el adaptador de email saliente existe en el código, pero no se presenta como entrega activa
  hasta configurar y verificar remitente y destinatario. La interfaz debe distinguir siempre la
  capacidad implementada del canal efectivamente habilitado en el despliegue público.
- Motivo: la autonomía no es comprensible si el usuario solo ve cómo empieza. Mostrar contacto,
  respuesta, verificación y retorno hace visible el valor completo sin inventar una integración real.

## D-019 — Email primero, contrato multicanal

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: implementar email como primer adaptador de contacto externo habilitable, sin convertirlo
  en la identidad completa del producto. La aprobación muestra canal, destinatario, asunto, mensaje,
  límites y retorno. Formulario web, WhatsApp y API comparten el modelo conceptual, pero permanecen
  rotulados como próximos adaptadores hasta tener ejecución, errores y verificación propios.
- Seguridad: el envío empresarial usa texto plano, destinatario ligado al plan aprobado, clave de
  idempotencia y dirección de respuesta específica del caso. El modo email no se considera completo
  ni se habilita públicamente sin remitente, destinatario de prueba y dominio verificados, además de
  recepción autenticada de respuestas. El sandbox continúa como único recorrido bidireccional P0.
- Motivo: demuestra una acción externa útil y una expansión creíble sin sacrificar la demo durable,
  ni confundir capacidad de transporte con resolución comprobada.

## D-020 — Gmail diferido y destinatarios externos bajo allowlist

- Fecha: 16 de agosto de 2026
- Estado: aceptada
- Decisión: rechazar Gmail para el MVP porque no existe evidencia de consentimiento verificado,
  cifrado/renovación/revocación de tokens ni renovación durable de watches. La capacidad se publica
  como `FUTURE`, sin autoridad de envío o lectura.
- Límite de email administrado: el canal solo puede anunciarse disponible cuando existen envío,
  recepción firmada y una allowlist explícita de dominios de destinatarios controlados. Una lista
  vacía deniega todos los destinatarios.
- Portabilidad: el segundo adaptador ejecutable es una API fixture HTTPS firmada, restringida a un
  endpoint exacto. Demuestra el contrato común sin afirmar una integración comercial.
- Motivo: maximiza una demostración honesta y segura sin solicitar acceso amplio al correo de las
  personas ni permitir que el hackathon se convierta en una plataforma de correo arbitrario.

## D-021 — Cerrar el winning loop antes de ampliar canales o recetas

- Fecha: 17 de agosto de 2026
- Estado: aceptada; prioriza y precisa D-016, D-017, D-018 y D-019
- Decisión: la siguiente entrega se rige por `specs/003-winning-product-loop`. DueBack conserva
  `Proof of Done` y Taskmaster, pero separa explícitamente `Accelerated Demo` de
  `Controlled Real Pilot`. La prioridad P1 es completar durante una sesión el circuito editable y
  durable `intake → aprobación → acción → evidencia insuficiente → retry/dedupe → prueba aceptada →
  retorno`, con timeline y evidencia técnica visibles.
- Bloqueo de seguridad: antes de habilitar email se elimina cualquier copia de valores esperados
  del plan hacia evidencia inbound ausente. La firma del proveedor, la identidad de contraparte y la
  suficiencia de la prueba se evalúan como propiedades separadas y fail-closed.
- Recorte: no se añaden recetas, canales nominales ni rediseños cosméticos que desplacen el intake
  durable, la edición completa, la identidad recuperable, el retorno verificable o la demo completa.
  Email real sigue limitado a buzones propios allowlisted y puede quedar fuera del recorrido público
  si sus gates no pasan; el sandbox controlado conserva la ruta reproducible.
- Motivo: auditorías independientes de consumidor, operación y jurado coincidieron en que la
  arquitectura es competitiva pero el producto actual rompe su promesa al terminar en fechas futuras,
  ocultar la autonomía, no permitir correcciones generales y contactar sólo al simulador. Cerrar el
  loop mejora simultáneamente utilidad, demo y comprensión de la arquitectura sin inventar alcance.

## D-022 — Email como transporte; la app como hogar recuperable

- Fecha: 17 de agosto de 2026
- Estado: aceptada; precisa D-018–D-021
- Decisión: la siguiente iteración se rige por `specs/004-consumer-case-inbox`. DueBack añadirá una
  identidad recuperable y un inbox personal `My follow-ups`; la página de caso será la fuente de
  verdad, control y evidencia. Email seguirá siendo el transporte controlado entre DueBack y la
  contraparte y el canal de retorno al dueño, no la interfaz completa del producto.
- Alcance P0: navegación e historial owner-scoped, detalle channel-aware, conversación segura,
  comparación `Promised vs Observed`, notificación durable de intervenciones y regreso cross-device.
  Una acción real requerirá identidad recuperable; el sandbox acelerado podrá conservar exploración
  anónima.
- Seguridad: ningún deep link será bearer; cambios de destinatario, resultado, importe, fecha o
  evidencia invalidarán la aprobación y exigirán una versión nueva. El piloto email conserva
  destinatarios propios allowlisted y separa aceptación de transporte, autenticidad, suficiencia de
  evidencia y resolución.
- Recorte: no se construirán dashboard empresarial, cliente de correo, Gmail OAuth, WhatsApp,
  automatización web arbitraria, directorio de empresas, banco, app nativa ni marketplace antes de
  cerrar este recorrido.
- Motivo: el runtime ya prueba acción durable y false-DONE, pero la identidad anónima ligada al
  navegador, la ausencia de una lista de casos y el retorno incompleto impiden que una persona lo
  use como producto. Esta decisión mejora utilidad y demo sin diluir la arquitectura ganadora.

## D-023 — Linking conserva UID; no existe merge automático entre propietarios

- Fecha: 17 de agosto de 2026
- Estado: aceptada; precisa D-022
- Decisión: una sesión anónima puede vincularse con Google cuando la credencial todavía no pertenece
  a otra cuenta, conservando el mismo Firebase UID y sus drafts. Si la credencial ya está asociada a
  un propietario existente, DueBack falla cerrado: no transfiere, mezcla ni reasigna casos. La persona
  inicia sesión con la cuenta existente y vuelve a crear o importar el draft sin ejecutar nada.
- Arquitectura: no se construye una ruta `identity/claim` ni un `identity-store` de migración para el
  hackathon. El historial se consulta exclusivamente por el UID autenticado; los deep links no son
  bearer y un owner diferente recibe el mismo 404 que un caso inexistente.
- Motivo: demostrar control de ambas sesiones y migrar propiedad transaccionalmente amplía demasiado
  la superficie de seguridad. El recorrido competitivo sólo necesita crear un caso bajo una cuenta
  recuperable y reabrirlo con esa misma identidad desde otro navegador.

## D-024 — Intake anónimo comienza siempre en la demo controlada

- Fecha: 17 de agosto de 2026
- Estado: aceptada; precisa D-019, D-020 y D-022
- Decisión: la configuración disponible de Managed Email no lo convierte en canal predeterminado.
  Todo intake nuevo comienza en `CONTROLLED_SANDBOX`; email requiere una selección explícita en la
  revisión, identidad recuperable y nueva versión/aprobación.
- Evidencia: una auditoría pública mostró que `COMPANY_CONTACT_MODE=email` hacía que los ejemplos y
  casos anónimos nacieran con un destinatario real allowlisted, bloquearan la demo por Google y
  conservaran fechas futuras en lugar del reloj acelerado. La política ahora tiene una prueba que
  permanece en sandbox aun cuando email está configurado.
- Motivo: subir una promesa no constituye permiso para contactar una dirección real. Este default
  reduce riesgo de envío accidental, mantiene la ruta reproducible para jueces y conserva email como
  piloto real opt-in, no como comportamiento implícito.

## D-025 — Reabrir el producto hasta cerrar el ciclo autónomo real

- Fecha: 18 de agosto de 2026
- Estado: aceptada; pospone el freeze de video y submission
- Decisión: implementar `specs/005-winning-follow-through` antes de grabar el video final. Un ACK
  insuficiente no puede dejar el caso esperando indefinidamente: debe existir un próximo seguimiento
  durable, acotado por la aprobación, o una intervención explícita al agotar presupuesto.
- Evidencia: el caso real de Managed Email rechazó correctamente `Request received`, pero la
  inspección de `EvidenceService` y `CaseRunner` demostró que no se crea otra Cloud Task después del
  envío exitoso ni del ACK débil. La auditoría pública también mostró `Gmail`/`Controlled` como
  empresa, `5900` como importe, enums internos y un `Next check` pasado.
- Motivo: esos defectos contradicen el valor central y reducen utilidad, credibilidad y claridad de
  demo. El producto no vuelve a considerarse cerrado hasta probar el ciclo reparado en producción.
