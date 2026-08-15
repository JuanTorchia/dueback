# Contrato de preproducto — DoneFlow

Fecha: 15 de agosto de 2026.

## Veredicto

**GO para un vertical mínimo; NO-GO para plataforma universal, marketplace o tres productos completos.**

La hipótesis a probar es:

> Las personas delegarán gestiones administrativas abiertas si entienden los límites, conservan el control y reciben evidencia auténtica de que el resultado ocurrió.

La promesa singular es:

> DoneFlow no permite que un agente confunda actividad con resultado: continúa hasta que evidencia verificable satisface un plan aprobado.

El enemigo de producto y métrica principal es el **false DONE**.

## Usuario inicial

Persona no técnica de 25–55 años que administra compras, cobros y vencimientos por email, tiene al menos dos gestiones administrativas mensuales y no quiere configurar automatizaciones.

Job-to-be-done:

> Cuando una gestión requiere varios pasos y esperar respuestas, quiero delegar el seguimiento sin perder control para no recordarla ni repetir información hasta que realmente se resuelva.

## Producto inicial

### Purchase Rescue — vertical completo

Alcance inicial: seguir una devolución o reembolso ya solicitado desde un recibo o email hasta obtener una resolución verificable.

```text
Documento o email
→ Gemini extrae caso, monto y campos inciertos
→ usuario revisa el Plan de resolución
→ usuario aprueba límites y acción
→ Action Broker consulta o envía seguimiento al Merchant Sandbox
→ respuesta PENDING o fallo recuperable
→ runtime persiste, espera y reintenta
→ callback firmado aporta evidencia
→ verifier rechaza evidencia insuficiente
→ DONE solo con confirmación válida
```

La demo debe mostrar que `request received` no equivale a `refund confirmed`.

### Bill Fixer — portabilidad reducida

La persona aporta dos facturas o un cargo señalado. Gemini propone la discrepancia; el usuario aprueba una consulta; DoneFlow la sigue hasta respuesta/corrección. No monitorea cuentas, acusa fraude, inicia chargebacks ni cancela servicios.

### Deadline Guardian — duración reducida

Una renovación inocua y controlada, como garantía, membresía o inscripción. Extrae fecha y requisitos, solicita faltantes y cierra únicamente con confirmación de renovación/presentación. Un recordatorio no es `DONE`.

RecallZero queda como fixture adversarial opcional del repositorio, no como cuarto producto ni parte obligatoria del video.

## Experiencia mínima

> **Actualización D-009**: la visión sigue siendo `share-first`, pero el MVP es
> `upload/paste-first`. Inbound email dejó de ser P0 y solo puede comenzar después del kill test.

La forma del producto final busca retornar por el canal de origen; durante el MVP el caso nace por
carga o texto pegado y la web se abre para aprobar, resolver una excepción o inspeccionar evidencia.
Consultar `channel-and-distribution-strategy.md` y D-009.

Cuatro vistas:

1. Entrada por email o fallback multimodal: `¿Qué necesitas que quede resuelto?`
2. Plan de resolución: resultado, acciones, límites, aprobaciones, evidencia y caducidad.
3. Ejecución: `Trabajando`, `Necesita tu decisión`, `Resuelto con prueba`.
4. Cierre: resultado, evidencia, tiempo, acciones, revocación y `No está resuelto`.

Acciones obligatorias: `Probar sin actuar`, `Activar`, `Cambiar límites`, `Detener` y `Reabrir`.

No se construye chat ni dashboard como interfaz principal.

## Arquitectura congelada

- TypeScript estricto y Next.js.
- Genkit con Gemini 3.5+ mediante Vertex AI.
- Cloud Run.
- Firestore para contratos, runs y eventos.
- Cloud Tasks para espera y reintentos.
- Zod, Vitest, Playwright y structured logging con `run_id`.
- Secret Manager para secretos desplegados.

Se elige **Genkit**, no ADK, porque permite un solo lenguaje y la rúbrica lo admite. La disciplina agentic se demostrará mediante tools, autorización, estado durable, reanudación, evidencia e idempotencia; no mediante una flota decorativa.

No entran inicialmente Pub/Sub, Cloud SQL, Kubernetes, marketplace, editor visual, billing, navegación web general, CAPTCHA, acceso bancario, Model Armor ni integraciones arbitrarias.

## Máquina de estados

```text
DRAFT → AWAITING_APPROVAL → READY → RUNNING
RUNNING → WAITING_EXTERNAL | WAITING_RETRY | NEEDS_ATTENTION | DONE | FAILED
WAITING_EXTERNAL → RUNNING | WAITING_RETRY
WAITING_RETRY → READY | NEEDS_ATTENTION
NEEDS_ATTENTION → READY | CANCELLED | EXPIRED
```

Reglas:

- Gemini nunca cambia estados, amplía permisos ni declara `DONE`.
- Los conectores nunca escriben directamente en el run.
- Un reducer determinista aplica transiciones.
- Toda transición crea un evento append-only.
- `DONE` exige todos los requisitos de evidencia verificados.

## Sandbox honesto

El Merchant Sandbox vivirá en el repositorio y la UI/README dirán:

> Controlled merchant simulator used to demonstrate asynchronous APIs, failures, callbacks and idempotency. It is not an integration with a real retailer.

Escenarios deterministas:

- `demo-success`: `PENDING` y callback confirmado.
- `demo-retry`: primer intento falla y el segundo se acepta.
- `demo-denied`: rechazo definitivo.
- misma idempotency key: una sola solicitud.
- webhook firmado y observable.

## Validación antes y durante el MVP

Entrevistar y probar prototipo con 5–8 personas no técnicas. Preguntar por el último caso real, no si “usarían IA”.

GO de adopción si:

- 5/8 tuvieron una gestión multietapa reciente;
- 4/8 abandonaron o demoraron una por seguimiento;
- 6/8 comprenden qué hará y qué no hará el sistema;
- 6/8 aprueban un plan sin ayuda en menos de tres minutos;
- 5/8 delegarían un caso real con permisos limitados;
- 7/8 distinguen solicitud enviada de resolución verificada.

Estas son metas de validación, no resultados existentes.

## Evaluación técnica

Publicar un corpus reproducible de 20 escenarios: 10 normales, 5 ambiguos y 5 adversariales/fallidos.

Métricas:

- verified resolution precision;
- false-DONE rate;
- recovery rate después de fallo;
- duplicate action rate;
- unauthorized action prevention rate;
- intervenciones humanas por resultado;
- tiempo y costo por resultado verificado.

Publicar todos los resultados, incluidos fallos.

## Tests de aceptación P0

- Contrato no aprobado: cero llamadas externas.
- Acción fuera del plan: `DENIED`.
- `request received`: nunca `DONE`.
- Callback con monto, referencia o `run_id` incorrecto: evidencia rechazada.
- Primer intento fallido: Cloud Tasks reintenta y puede completar.
- Dos callbacks iguales: una sola consecuencia.
- Reinicio: el run conserva estado y reanuda.
- Webhook sin firma: HTTP 401 y cero transición.
- Prompt injection en recibo: se trata como datos.
- Escritura concurrente: una transición gana y la otra reintenta.
- Las tres recetas validan contra el mismo schema y reducer.

## Orden de construcción

1. Schema, reducer, eventos y tests.
2. Evidence Verifier y prevención de false DONE.
3. Policy Engine y Action Broker idempotente.
4. Firestore, Cloud Tasks, pausa y reanudación.
5. Genkit/Gemini con extracción tipada y provenance.
6. Merchant Sandbox y Purchase Rescue end-to-end.
7. Timeline y UI de aprobación/cierre.
8. Despliegue y test end-to-end.
9. Bill Fixer reducido.
10. Deadline Guardian reducido.
11. Corpus adversarial, documentación y video.

Si Purchase Rescue no funciona end-to-end antes de construir las recetas secundarias, estas se congelan.

## Definition of Done

El MVP existe solo cuando una persona puede cargar un documento, aprobar un Plan de resolución, observar una acción asíncrona idempotente, presenciar un fallo recuperable y recibir prueba verificable del resultado en una aplicación desplegada.

Además:

- Gemini 3.5+ y Genkit cumplen una función esencial y visible.
- Cloud Run, Firestore y Cloud Tasks son verificables.
- Un reinicio no pierde progreso.
- Ninguna acción ocurre sin aprobación.
- Evidencia inválida nunca produce `DONE`.
- Sandboxes y fixtures están rotulados en UI, README y video.
- Existe test end-to-end contra el despliegue.
- Jueces pueden reproducir sin credenciales pagas.
- README, diagrama, licencias y `.env.example` están completos.
- No existen secretos, datos personales ni afirmaciones falsas.

## Condición de pivot

Volver a RecallZero como wedge si la primera prueba técnica muestra que:

- el Plan de resolución es solo JSON sin efecto operativo;
- no existe acción externa observable;
- no se demuestra espera/reanudación;
- cada receta exige un runtime diferente;
- Gemini puede eliminarse sin cambiar la demo;
- el flujo tarda más de 45 segundos en explicarse.
