# DoneFlow — agentes que terminan el trabajo

Estado: concepto candidato para auditoría.

> **Resultado de auditoría:** GO condicionado. Consultar `doneflow-jury-audit.md`. El posicionamiento recomendado es `outcome-assurance layer`, no marketplace/constructor universal. Purchase Rescue será la demo principal; Bill Fixer y Deadline Guardian demostrarán reutilización y duración.

## Tesis

Los asistentes actuales terminan cuando producen una respuesta. DoneFlow termina cuando existe evidencia verificable de que el objetivo de la persona se cumplió.

> Describe what “done” means. DoneFlow keeps working until it can prove it.

DoneFlow es una plataforma personal de agentes durables y recetas compartibles. Una persona describe una tarea recurrente o instala una receta; el sistema convierte la intención en un **Outcome Contract** seguro y ejecutable.

## Outcome Contract

Cada receta usa el mismo contrato:

- **Goal:** resultado deseado.
- **Trigger:** evento, fecha, correo, foto, documento o cambio de datos.
- **Inputs:** fuentes permitidas y datos mínimos.
- **Actions:** herramientas y operaciones autorizadas.
- **Boundaries:** gasto, frecuencia, dominios, horarios y datos prohibidos.
- **Approvals:** decisiones que requieren confirmación humana.
- **Evidence:** prueba necesaria para declarar `DONE`.
- **Fallbacks:** reintentos, escalación y ruta manual.
- **Expiry:** cuándo abandonar o renegociar el objetivo.

Gemini ayuda a crear el contrato y resolver información no estructurada. Un policy engine determinista valida permisos, transiciones y evidencia. El modelo nunca se concede permisos a sí mismo.

## Producto

### Para personas

- Crear una tarea en lenguaje natural, voz o foto.
- Revisar visualmente qué observará y qué podrá hacer.
- Aprobar un Outcome Contract antes de activarlo.
- Ver una inbox de excepciones, no una conversación interminable.
- Recibir el resultado junto con su evidencia.

### Para creadores

- Publicar recetas reutilizables con conectores reemplazables.
- Versionar contratos y políticas.
- Ejecutar una simulación antes de publicar.
- Definir pruebas de éxito, rechazo y recuperación.

### Marketplace futuro

- Instalar recetas como se instala un plugin.
- Ver permisos, fuentes, costo estimado y evidencia exigida antes de instalar.
- Adaptar idioma, país, proveedor y herramienta sin cambiar el contrato central.
- Calificar recetas por tasa de resolución verificada, no por cantidad de respuestas.

## Tres recetas de demostración

Las tres deben compartir runtime, contrato, timeline, policy engine y registro de evidencia.

### 1. RefundRunner — recuperar una devolución o reembolso

**Problema:** las personas pierden dinero porque deben localizar recibos, entender políticas, iniciar solicitudes y perseguir respuestas.

**Trigger:** correo/recibo o frase “quiero devolver esto”.

**Flujo:**

1. Gemini extrae comercio, artículo, fecha y evidencia desde recibo o email.
2. La receta consulta una política permitida y calcula opciones.
3. La persona aprueba el canal y cualquier costo.
4. El agente inicia la solicitud mediante un conector real o sandbox claramente etiquetado.
5. Monitorea correo/estado, responde solo dentro de límites y escala excepciones.
6. Declara `DONE` únicamente con confirmación del comercio y evidencia de reembolso/recepción.

**Demuestra:** documentos, email, acciones externas, seguimiento de días, aprobación y proof-of-resolution.

### 2. SlotScout — encontrar y reservar un turno compatible

**Problema:** turnos médicos no urgentes, trámites, talleres o servicios aparecen en horarios impredecibles y obligan a revisar repetidamente.

**Trigger:** objetivo y restricciones de calendario.

**Flujo:**

1. La persona define ubicación, rango, horarios, precio y prioridad.
2. El agente consulta únicamente proveedores autorizados.
3. Cruza disponibilidad con calendario y tiempo de traslado.
4. Puede reservar automáticamente dentro de límites o pedir aprobación.
5. Evita reservas duplicadas y libera holds vencidos.
6. Declara `DONE` con identificador de confirmación y evento de calendario.

**Demuestra:** polling/eventos, preferencias persistentes, calendar tools, idempotencia y límites.

**Límite:** no se automatizarán CAPTCHA ni sitios que prohíban automatización; la demo usará una API/conector autorizado.

### 3. RecallZero — retirar un producto inseguro de circulación

**Problema:** productos usados cambian de dueño y pierden el vínculo con el comprador original; un recall puede aparecer después de una inspección.

**Trigger:** foto/placa de producto y eventos de una fuente oficial.

**Flujo:**

1. Gemini identifica candidatos desde etiquetas deterioradas.
2. El matcher determinista decide `CLEAR`, `HOLD` o `NEED_MORE_EVIDENCE`.
3. Un recall nuevo inicia un barrido retroactivo.
4. El agente crea y escala una tarea de cuarentena.
5. Declara `DONE` con evidencia ligada a unidad/caso y aprobación autorizada.

**Demuestra:** multimodalidad, fuentes hostiles, policy engine, memoria durable, seguridad e impacto físico.

## Demo principal y demos secundarias

No intentaremos ejecutar tres workflows completos en cuatro minutos.

- **Demo principal:** RefundRunner de extremo a extremo porque cualquier juez comprende dinero recuperado y permite una acción externa clara.
- **Prueba de generalidad:** activar SlotScout y RecallZero desde plantillas, mostrando que generan el mismo tipo de Outcome Contract y timeline.
- **Repositorio:** tests completos para al menos una ruta feliz, una ambigua y una fallida de cada receta.

Esta selección es provisional y debe sobrevivir auditoría técnica y de mercado.

## Arquitectura conceptual

- **Contract Builder:** Gemini convierte intención multimodal en un borrador tipado.
- **Policy Compiler:** valida acciones, límites, aprobaciones y evidencia.
- **Recipe Registry:** plantillas versionadas y manifiestos de conectores.
- **ADK Orchestrator:** ejecuta pasos, pausa, reanuda y escala.
- **Action Broker:** única frontera hacia herramientas, con IAM y parámetros cerrados.
- **Evidence Verifier:** valida artefactos y exige revisión donde no existe prueba automática.
- **Durable State:** Firestore y/o Agent Runtime/Memory Bank.
- **Event Bus:** Pub/Sub y Cloud Tasks con reintentos/DLQ.
- **Observability:** timeline de usuario y trazas técnicas correlacionadas.
- **Safety:** Model Armor, provenance, aislamiento de contenido, secretos y controles deterministas.

## Encaje con Google

DoneFlow lleva la narrativa de Gemini Enterprise Agent Platform a individuos y pequeños equipos:

- delegar resultados, no prompts;
- agentes que trabajan durante días;
- memoria persistente;
- identidad y permisos explícitos;
- registro/versionado de agentes-receta;
- observabilidad y evaluación;
- seguridad ante contenido externo.

Google Cloud es el runtime; Gemini interpreta intención y datos; las recetas son la capa de distribución.

## Categoría propuesta

**The Taskmaster.**

El proyecto completa workflows reales y multietapa. Collaborative Partner enfatiza diálogo/adaptación; Fortified Enterprise Fleet exigiría alcance institucional innecesario.

## Ángulo comercial

> WordPress made publishing extensible. DoneFlow makes delegation extensible.

La visión no es un asistente universal que improvisa cualquier cosa. Es un ecosistema de contratos pequeños, transparentes, instalables y verificables.

## Métricas

- Verified resolution rate.
- Time to verified outcome.
- Human interventions per resolved task.
- Duplicate/unauthorized actions prevented.
- Recovery rate after connector failure.
- Cost per verified outcome.

No se inventarán valores. Para el hackathon se reportarán resultados de un conjunto de evaluación reproducible.

## Riesgos

- Parecer una plataforma vacía con tres demos falsas.
- Competir frontalmente con Agent Studio, IFTTT, Zapier o constructores de agentes.
- Hacer que Gemini parezca un generador de JSON reemplazable.
- Usar conectores sandbox y exagerar producción real.
- Scope excesivo para una persona.
- Marketplace sin usuarios ni recetas de terceros.
- Contratos generados que oculten permisos peligrosos.
- Diferencias legales y de APIs entre países.

## Recorte mínimo

El hackathon solo construirá:

1. Un schema de Outcome Contract.
2. Un runtime durable con cinco o seis estados.
3. Un Action Broker con dos conectores reales/controlados.
4. Un timeline auditable.
5. RefundRunner completo.
6. SlotScout y RecallZero como recetas funcionales reducidas usando el mismo motor.
7. Un pequeño paquete de pruebas adversariales y de recuperación.

No se construirá marketplace comercial, facturación, editor visual completo ni integraciones arbitrarias.
