# Prompt maestro — DueBack Multichannel Follow-Through

Usar este documento como entrada completa para la próxima ejecución de `/speckit.specify`. La nueva
especificación debe extender el producto existente y no reemplazar ni reescribir el walking skeleton
que ya funciona.

## Resultado buscado

Convertir DueBack en un agente personal que transforma cualquier resultado pendiente en un caso
activo, contacta a la contraparte mediante un canal explícitamente autorizado, interpreta sus
respuestas, continúa el seguimiento dentro de límites aprobados y devuelve al usuario solamente una
decisión necesaria o evidencia verificable del resultado.

La promesa de producto debe poder entenderse así:

> Compartí lo que te prometieron. Revisá cómo DueBack los contactará. Después dejá que continúe el
> seguimiento hasta que exista evidencia suficiente.

DueBack no es un redactor de emails, un recordatorio, un chatbot, un CRM genérico ni una garantía de
que una empresa cumplirá. Su diferenciación es `Proof of Done`: actividad, entrega de un mensaje,
acuse de recibo y resolución verificada son estados distintos.

## Base existente que debe conservarse

- Next.js, TypeScript estricto y workspace pnpm.
- Gemini 3.5 Flash mediante Vertex AI y Genkit para extracción multimodal tipada.
- Cloud Run, Firestore, Cloud Tasks y Firebase Authentication.
- Plan versionado y aprobación ligada a propietario, hash y expiración.
- Policy engine, Action Broker, idempotencia y máquina de estados deterministas.
- Merchant Sandbox separado, con callbacks firmados y aceleración claramente rotulada.
- Rechazo visible de `REQUEST_ACKNOWLEDGED` como evidencia insuficiente.
- Cierre máximo actual `MERCHANT_CONFIRMED`; nunca afirmar liquidación bancaria.
- Timeline, control del caso, notificaciones persistentes y evidencia reproducible.
- Entrada unificada mediante texto, imagen o PDF, con incertidumbre y citas.
- Adaptador Resend idempotente para notificaciones al usuario.
- Adaptador Resend para contacto empresarial, actualmente deshabilitado en producción.
- Los archivos de `user-testing-feedback/` son auditoría sintética del usuario y no constituyen
  participantes humanos, métricas ni testimonios.

## Decisión de producto multicanal

Email es el primer canal externo real, pero no define por sí solo el producto. Todo canal debe
implementar el mismo contrato de capacidades y seguridad. Los canales inicialmente contemplados son:

1. `MANAGED_EMAIL`: DueBack envía desde un remitente propio verificado y recibe las respuestas en
   una dirección específica del caso.
2. `GMAIL_CONNECTED`: el usuario autoriza enviar desde su Gmail mediante OAuth; solo se construirá
   después del email administrado y sin solicitar lectura global del buzón cuando pueda evitarse.
3. `WEB_FORM`: adaptador para formularios autorizados, sin navegación arbitraria, CAPTCHA bypass ni
   descubrimiento autónomo de URLs.
4. `WHATSAPP`: adaptador futuro mediante API oficial y plantillas/reglas compatibles; no automatizar
   cuentas personales ni scraping.
5. `PARTNER_API`: API oficial de una contraparte o plataforma, con herramientas cerradas y esquema
   tipado.
6. `CONTROLLED_SANDBOX`: canal reproducible del hackathon; debe permanecer visible como demo y nunca
   presentarse como empresa real.

La interfaz puede mostrar canales futuros únicamente con estado `próximo` o `no conectado`. No debe
permitir seleccionar o aprobar un canal que no pueda ejecutar y verificar en ese despliegue.

## Prioridad y alcance

### P0 — Email administrado bidireccional

Construir un recorrido real y acotado:

1. El usuario carga o pega evidencia.
2. Gemini extrae la promesa, la empresa y posibles datos de contacto sin usar herramientas.
3. El usuario confirma o escribe el email exacto de soporte.
4. DueBack muestra destinatario, remitente, reply-to, asunto, cuerpo, datos compartidos, momento del
   primer envío, cadencia máxima, condición de escalamiento y evidencia necesaria.
5. La aprobación liga todos esos datos a una nueva versión y hash del plan.
6. Cloud Tasks despierta el caso y el Action Broker envía exactamente un mensaje autorizado.
7. El proveedor devuelve receipt de aceptación y eventos de entrega/rebote.
8. Una respuesta entrante autenticada se correlaciona por dirección de caso, Message-ID y case ID.
9. Gemini extrae afirmaciones y candidatos de evidencia sin autoridad de herramientas ni estado.
10. El verificador determinista decide si la respuesta es insuficiente, requiere decisión, permite
    otro seguimiento o satisface el nivel de evidencia aprobado.
11. DueBack notifica al usuario y actualiza la página del caso.

El envío debe probarse inicialmente solo contra destinatarios autorizados y controlados por el
participante. No enviar mensajes no solicitados a empresas durante desarrollo o evaluación.

### P1 — Gmail conectado

- OAuth incremental, solicitado únicamente al activar este canal.
- Usar `gmail.send` para envío; evitar acceso amplio a la bandeja.
- Evaluar recepción mediante alias/reply-to administrado por DueBack para no solicitar lectura.
- Si se decide leer respuestas desde Gmail, documentar scopes sensibles/restringidos, verificación,
  política de datos y riesgo de calendario. No implementar si pone en peligro la entrega.
- Gmail debe ser un adaptador adicional, no una bifurcación del runtime.

### P2 — Prueba de portabilidad

- Un contrato ejecutable reducido para `WEB_FORM` o `PARTNER_API`, no ambos.
- WhatsApp permanece únicamente como diseño hasta existir acceso oficial y prueba autorizada.
- Probar que cambiar de adaptador no altera aprobación, idempotencia, timeline ni verificación.

## Experiencia de usuario obligatoria

### Pantalla 1 — Entregar el problema

- Un único compositor para escribir, pegar y adjuntar.
- Explicar con ejemplos concretos que admite refund, cancellation, replacement, document y otros
  resultados pendientes.
- Feedback inmediato, progreso real, timeout, retry y conservación del contenido.
- El usuario debe poder abandonar y volver durante el análisis cuando el intake sea durable.

### Pantalla 2 — Aprobar la conversación

Debe responder sin ambigüedad:

- ¿Qué entendió DueBack?
- ¿Qué resultado persigue?
- ¿Quién es responsable?
- ¿Por qué canal lo contactará?
- ¿Cuál es el destinatario exacto?
- ¿Qué mensaje saldrá primero?
- ¿Qué datos se compartirán?
- ¿Cuándo insistirá nuevamente y cuántas veces como máximo?
- ¿Qué nunca hará?
- ¿Qué respuesta contará como evidencia?
- ¿Cuándo volverá a consultar al usuario?
- ¿Cómo recibirá el usuario una actualización?

La vista debe parecer una conversación delegada y no un formulario técnico. Debe incluir preview de
mensaje, editor de destinatario, selector de canal únicamente entre canales habilitados, resumen de
permisos y CTA inequívoco. Cambiar cualquier campo autorizado debe producir nueva versión y hash e
invalidar la aprobación anterior.

### Pantalla 3 — Seguimiento

- Mostrar estado humano: esperando plazo, enviado, entregado, esperando respuesta, respuesta
  insuficiente, decisión necesaria, seguimiento programado o evidencia aceptada.
- Mostrar el circuito visual `DueBack → contraparte → respuesta → verificación → usuario`.
- Mostrar siguiente acción y hora, límite de intentos, botón detener y canal de retorno.
- No exigir refresco manual; usar polling, SSE o estado reanudable según la arquitectura elegida.
- Mantener detalles técnicos colapsados para el jurado: receipt, idempotency key, correlation ID,
  adapter, retry, callback/webhook y policy version.

### Notificaciones al usuario

- Dos eventos P0: `NEEDS_ATTENTION` y `CASE_COMPLETED`.
- Un único adapter real inicialmente, con NotificationRecord persistente y deduplicado.
- Mostrar claramente si la notificación es in-app, email entregado, email rebotado o demo sink.
- No prometer push, SMS o WhatsApp antes de implementarlos.

## Contrato de canal

Definir un `ChannelAdapter` tipado con capacidades explícitas:

- `channelType`
- `canSend`
- `canReceive`
- `supportsThreading`
- `supportsDeliveryReceipt`
- `supportsAuthenticatedReply`
- `requiresUserOAuth`
- `send(actionEnvelope)`
- `normalizeInbound(event)`
- `health/configuration status`

Cada acción debe producir `ActionReceipt` con provider ID, canal, recipient hash, acceptedAt y estado
de entrega conocido. Un receipt de transporte prueba aceptación del proveedor, no lectura,
respuesta ni resolución.

Cada evento entrante debe producir un `InboundEnvelope` con provider event ID, channel, sender,
recipient/case route, Message-ID/thread ID, timestamp, content hash, authentication result,
attachments metadata y provenance. El conector no puede escribir directamente `DONE`.

## Estados y evidencia

Extender sin romper la máquina existente para distinguir al menos:

- `READY`
- `SCHEDULED`
- `SENDING`
- `WAITING_EXTERNAL`
- `DELIVERED`
- `BOUNCED`
- `RESPONSE_RECEIVED`
- `NEEDS_ATTENTION`
- `WAITING_RETRY`
- `DONE`
- `STOPPED`
- `EXPIRED`

Los estados del transporte pueden modelarse como eventos o subestado si evita una migración riesgosa.
La especificación debe elegir una representación única y justificarla.

Mantener niveles de evidencia separados:

- mensaje enviado;
- proveedor aceptó el mensaje;
- contraparte acusó recibo;
- contraparte se comprometió;
- contraparte confirmó ejecución;
- resultado externo independiente, cuando exista.

Una respuesta de email no es auténtica solo porque llegó al reply-to. Evaluar SPF/DKIM/DMARC y
cabeceras disponibles como señales, pero no prometer identidad infalible. Para cierre automático P0,
usar una contraparte controlada o una confirmación cuyo issuer y campos cumplan una política
determinista. Las demás respuestas deben permanecer abiertas o requerir revisión.

## Arquitectura Google y proveedores

- Gemini/Genkit: extracción del documento inicial, clasificación de respuesta, extracción de
  candidatos de evidencia y explicación de incertidumbre.
- Cloud Run: web, workers y endpoints de webhooks.
- Firestore: planes, approvals, cases, action ledger, inbound ledger, evidence, notifications y
  audit events.
- Cloud Tasks: scheduling, retries y reanudación durable.
- Pub/Sub: usarlo cuando aporte una frontera real —por ejemplo Gmail push—, no para sumar un logo.
- Gmail API: adaptador opcional para cuentas conectadas, sujeto a OAuth y scopes.
- Resend: transporte inicial de email administrado; es un periférico, no el cerebro del agente.
- Merchant Sandbox: prueba bidireccional reproducible con fallo, duplicado y callbacks.

No reemplazar un proveedor simplemente para aumentar el número de servicios Google. Toda integración
debe mejorar una dimensión visible de utilidad, arquitectura o preparación de demo.

## Seguridad, abuso y privacidad

- Destinatario, canal, remitente, cuerpo, campos compartidos, cadencia y máximo de mensajes deben
  quedar ligados al plan aprobado.
- Validar sintaxis de email y bloquear dominios/recipients no autorizados durante piloto.
- Mantener lista de destinatarios verificados para desarrollo y evaluación.
- Idempotencia local durable además de la ventana de idempotencia del proveedor.
- Verificar firmas de webhooks, timestamp, nonce y replay.
- Descargar contenido entrante server-side solo desde endpoints exactos del proveedor.
- Limitar tamaño, cantidad y tipos de attachments; no renderizar HTML remoto ni cargar pixels.
- Tratar asunto, cuerpo, firmas, quoted text, headers y attachments como datos hostiles.
- Gemini no recibe secretos ni herramientas; no puede modificar destinatario o permisos.
- Evitar incluir documento fuente completo o PII innecesaria en prompts, logs y emails.
- Redactar destinatarios en observabilidad; almacenar hashes donde alcance.
- Rate limits por propietario, caso, destinatario, dominio y canal.
- Bounces, complaints y suppression deben detener nuevos envíos y crear intervención.
- Unsubscribe no aplica a un mensaje transaccional de caso de la misma manera que marketing, pero
  debe existir Stop y una política de no abuso visible.
- El usuario debe confirmar que tiene una relación legítima con la contraparte y autorización para
  realizar el seguimiento.
- No automatizar amenazas legales, chargebacks, publicaciones públicas, pagos ni cambios de remedio.

## Fallos y recuperación

Especificar conducta determinista para:

- timeout antes/después de que el proveedor acepte el email;
- provider 429/5xx;
- respuesta sin receipt;
- webhook duplicado, tardío, inválido o fuera de orden;
- email rebotado o suprimido;
- respuesta desde sender inesperado;
- thread/case ambiguo;
- respuesta vacía, auto-reply o out-of-office;
- prompt injection en firma o cuerpo;
- attachments corruptos o demasiado grandes;
- reinicio entre envío y persistencia del receipt;
- cambio/revocación de plan mientras una tarea está en vuelo;
- límite de seguimientos agotado;
- usuario borra el caso mientras llega una respuesta.

Nunca resolver incertidumbre enviando el mismo mensaje otra vez sin comprobar el ledger.

## Estrategia de pruebas

### Unitarias

- generación determinista del mensaje;
- autorización de canal y destinatario;
- idempotency key estable;
- parsing y normalización inbound;
- clasificación de auto-reply/acknowledgement;
- política de evidencia;
- redacción y límites.

### Contrato

- fixtures oficiales/sintéticos de Resend webhook y Gmail API/Pub/Sub;
- firma válida, inválida, replay y timestamp;
- receipt de envío, delivered, bounced, complained y received;
- compatibilidad del `ChannelAdapter` entre sandbox y email.

### Integración

- first failure then success sin correo duplicado;
- envío aceptado pero persistencia interrumpida;
- respuesta insuficiente mantiene el caso abierto;
- respuesta que cambia monto/remedio crea intervención;
- stop/revoke impide el siguiente seguimiento;
- callback de otro caso no cruza tenants.

### Navegador determinista

- elegir canal habilitado;
- corregir destinatario;
- revisar mensaje y datos compartidos;
- aprobar versión actual;
- ver envío/espera/respuesta/resultado;
- error y retry accionables;
- móvil, teclado, lector de pantalla y 200% zoom.

### Smoke externos

- envío real solo a buzón controlado;
- recepción real de respuesta controlada;
- correlation/thread preservados;
- una prueba de bounce autorizada;
- registrar tiempos, IDs y fallos sin publicar direcciones ni tokens.

## Demo ganadora en menos de cuatro minutos

1. Mostrar una promesa realista en captura o PDF.
2. Gemini extrae datos con citas e incertidumbre visible.
3. La persona revisa canal, destinatario y mensaje exacto.
4. Aprobación crea una versión/hash y programa el caso.
5. Cerrar la pestaña; Cloud Tasks continúa.
6. Mostrar receipt externo y una respuesta `request received` rechazada.
7. Inyectar o mostrar un fallo/retry sin acción duplicada.
8. Recibir evidencia suficiente mediante sandbox firmado o email controlado autenticado.
9. Mostrar notificación, Proof of Done, timeline y limitación exacta.
10. Cerrar con arquitectura Google Cloud y una métrica reproducible del corpus.

Si el email real no es bidireccional y estable, no debe reemplazar al sandbox en el video principal.
Puede mostrarse como segunda acción externa real, rotulada honestamente.

## Criterios de éxito

- Cero acción externa antes de aprobación.
- Cero acción a destinatario distinto del plan.
- Cero duplicados en pruebas de retry/redelivery.
- Cero `DONE` por delivery receipt o acknowledgement.
- Respuesta entrante correlacionada al caso correcto o enviada a revisión.
- El usuario comprende antes de aprobar canal, mensaje, límites, prueba y retorno.
- El caso continúa después de cerrar la pestaña.
- Todos los claims distinguen sandbox, email real controlado y adaptadores futuros.
- La entrega mantiene un recorrido público gratuito y reproducible.

Estos son objetivos y gates, no resultados observados. No declarar tasas hasta ejecutar el corpus.

## Gates de implementación

### Gate A — Email outbound

- dominio/remitente verificado;
- secret en Secret Manager;
- destinatario piloto autorizado;
- envío idempotente y receipt persistido;
- UI y timeline reflejan el nivel exacto.

### Gate B — Email inbound

- reply domain configurado;
- webhook firmado y replay-safe;
- contenido recuperado con límites;
- correlación exacta al caso;
- respuestas ambiguas nunca cierran automáticamente.

### Gate C — Producto bidireccional

- flujo desplegado sobre Cloud Run;
- cierre y reapertura probados;
- notification adapter real;
- E2E sin retries ocultos;
- documentación y diagrama actualizados.

### Gate D — Gmail opcional

- evaluación de OAuth/scopes aceptada;
- experiencia incremental clara;
- token cifrado, revocación y refresh seguros;
- no compromete el video ni el plazo.

## No objetivos de esta fase

- marketplace de agentes;
- editor genérico de workflows;
- navegación web libre;
- resolución de CAPTCHA;
- llamadas telefónicas autónomas;
- WhatsApp no oficial;
- acceso bancario;
- asesoramiento legal;
- scraping de contactos;
- envío masivo;
- soporte mundial declarado;
- cierre automático basado solo en texto generado por el modelo.

## Preguntas que `/speckit.clarify` debe resolver

1. ¿Qué dominio y proveedor controlarán el email administrado?
2. ¿Qué destinatarios exactos están autorizados para el piloto y la demo?
3. ¿Las respuestas llegarán a dominio Resend, dominio propio o buzón Gmail controlado?
4. ¿Qué evidencia de una respuesta real permite `DONE` sin revisión humana?
5. ¿Cuál es la cadencia y máximo de seguimientos por defecto?
6. ¿Qué datos personales mínimos aparecen en el mensaje?
7. ¿Cómo se notifica al usuario sin obligarlo a dejar la pestaña abierta?
8. ¿Gmail aporta suficiente valor antes del deadline para justificar OAuth?
9. ¿Cuál será el segundo adaptador ejecutable reducido: web form o partner API?
10. ¿Qué parte exacta entra en el video y qué queda documentada como futura?

## Entregables exigidos por la ceremonia Spec Kit

- `spec.md` con escenarios, requisitos verificables, edge cases y criterios de éxito.
- `clarifications` sin marcadores críticos pendientes.
- checklist de calidad, seguridad, privacidad y honestidad de claims.
- `plan.md` con arquitectura, migración, secretos, proveedores y gates.
- `research.md` con decisión Resend/Gmail/Pub/Sub y restricciones OAuth.
- `data-model.md` con ChannelConfiguration, ActionReceipt, InboundEnvelope y MessageThread.
- contratos OpenAPI para capabilities, webhook inbound y estado de delivery.
- eventos de dominio para envío, delivery, bounce, inbound, verification e intervention.
- `tasks.md` ordenado por walking skeleton, con pruebas antes del despliegue público.
- quickstart reproducible sin secretos reales.
- actualización de decision log, arquitectura, README, demo script y evidencia de despliegue.

La especificación debe preservar la Constitución DueBack: evidencia antes que actividad, autoridad
humana, ejecución durable/idempotente, claims honestos y el menor slice capaz de ganar.
