# Segunda auditoría multiagente

Fecha: 15 de agosto de 2026.

## Perfiles de jurado

1. Operaciones reales de donaciones y reventa.
2. Red team de seguridad para agentes autónomos.
3. Jurado de Grand Prize, inversión y narrativa.

## Veredicto conjunto

**GO condicional con un nuevo recorte.**

SecondLife Safety tiene potencial de top 10, pero todavía no top 3. Para subir necesita:

- usuario/comprador preciso;
- categoría de producto realmente aceptada y examinada;
- evidencia de un workflow manual actual;
- seguridad implementada y medida, no prometida;
- replay transparente de un recall histórico real;
- cierre respaldado por evidencia y aprobación identificada.

## Corrección operativa importante

Muchas organizaciones rechazan categorías infantiles como cunas, asientos de auto y cochecitos. Usarlas como MVP puede hacer que la historia sea emocionalmente fuerte pero operacionalmente falsa.

La auditoría recomienda comenzar con:

- **Usuario:** responsable de intake/producción de una tienda de reutilización tipo Habitat ReStore.
- **Categoría:** herramientas eléctricas usadas.
- **Razón:** suficiente valor para inspección individual; marca/modelo/placa visibles; riesgo comprensible; cuarentena demostrable; categoría normalmente aceptada.

Fuentes:

- CPSC para resellers/thrift stores: https://www.cpsc.gov/FAQ/ResaleThrift-Stores
- API oficial de CPSC: https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information
- Habitat ReStore FAQ: https://www.habitat.org/restores/faq
- Goodwill, categorías aceptadas/no aceptadas: https://goodwillintl.zendesk.com/hc/en-us/articles/1260805698630-Donation-Items-Acceptable-vs-Not-Acceptable

## Concepto refinado

# RecallZero

**The autonomous safety layer for second-hand commerce.**

La tienda de reutilización es el escenario inicial, no el mercado completo. La visión incluye recommerce, refurbishers, liquidadores, alquileres, marketplaces y reverse logistics.

### Wedge del MVP

> RecallZero inspects high-risk used power tools at intake, remembers every unit, and automatically pulls affected inventory when a new recall appears—even days after inspection.

### Ángulo único

Una inspección es solo una foto del conocimiento disponible hoy. Un recall puede publicarse mañana. RecallZero mantiene una memoria viva de cada unidad de alto riesgo y ejecuta un barrido retroactivo autónomo cuando cambia la información oficial.

Este segundo momento de valor justifica:

- ejecución durable;
- eventos en segundo plano;
- memoria persistente;
- reintentos e idempotencia;
- permisos por rol/sede;
- observabilidad;
- escalación hasta contención verificada.

Sin el barrido retroactivo, el producto sería un buscador visual de recalls.

## Workflow adoptable

1. Solo artículos de una `high-risk lane` pasan por el sistema.
2. El empleado genera un QR temporal y fotografía producto y placa.
3. Gemini extrae candidatos y señala la región visual que respalda cada campo.
4. El matcher determinista consulta una fuente oficial y devuelve `clear`, `hold_for_review` o `reject`.
5. Una persona conserva la decisión final.
6. Las unidades aceptadas permanecen indexadas mientras estén en inventario.
7. Un nuevo recall dispara un barrido retroactivo.
8. El agente crea una tarea de cuarentena con idempotency key, plazo y rol responsable.
9. Si falla o no hay respuesta, reintenta y escala.
10. El caso cierra con QR escaneado en cuarentena, evidencia ligada a un nonce y aprobación del supervisor.

No se afirmará que una fotografía certifica destrucción física. Solo prueba coherencia de evidencia y aprobación humana.

## Red team: ataques que debemos demostrar

- Prompt injection dentro de etiqueta, QR, PDF o email.
- Fuente permitida comprometida o contenido de terceros incrustado.
- Tool-output poisoning.
- Modelos casi idénticos o serial incompleto.
- Foto de evidencia reciclada entre unidades/sedes.
- Doble entrega del mismo evento.
- Override de un rol sin autorización.
- Exfiltración de inventario mediante parámetros de herramientas.
- Archivos enormes, URLs internas, spam y retries sin límite.
- PII incidental en fotos, EXIF y logs.

## Arquitectura mínima segura

- Ingesta aislada con límite de MIME/tamaño, eliminación de EXIF, hash y procedencia.
- Gemini extractor sin herramientas ni credenciales; salida JSON tipada con evidence spans.
- Un adaptador oficial de recalls y snapshots versionados.
- Matcher/policy engine determinista: `UNKNOWN` nunca equivale a `SAFE`.
- Orquestador ADK sobre objetos normalizados y máquina de estados explícita.
- Action broker separado con IAM mínimo, parámetros cerrados, rate limits e idempotencia.
- Firestore transaccional y Pub/Sub/Cloud Tasks con DLQ.
- Auditoría append-only con actor, versión de política, hashes y reason codes.
- Evidencia capturada con nonce/unidad/caso y aprobación humana.
- Model Armor y DLP como defensa en profundidad, nunca como garantía total.

## Cinco pruebas visibles

1. PDF falso solicita exportar inventario: bloqueado, cero tool calls.
2. QR con prompt injection: identidad extraída, instrucción tratada como datos contaminados.
3. Serial incompleto: `NEED_MORE_EVIDENCE`, nunca `SAFE`.
4. Evento duplicado: dos deliveries, una tarea.
5. Foto reutilizada: mismatch de nonce/unidad, cierre rechazado.

## Puntuación de los jurados

| Jurado            |                                         Actual |                            Techo condicionado |
| ----------------- | ---------------------------------------------: | --------------------------------------------: |
| Operaciones       |                                          3.1/5 |  4.2/5 con high-risk lane y workflow validado |
| Seguridad         | 2.0–2.5/5 en implementación actual inexistente |              4.5–4.6/5 implementado y probado |
| Pitch/Grand Prize |                                         4.24/5 | 4.66/5 con validación y framing de recommerce |

## Posición competitiva estimada

- Documentación actual: no pasa Stage 1; todavía no existe producto.
- Gran demo sin validación: potencial top 10.
- Workflow validado + implementación segura + demo impecable: potencial top 3.
- Para Grand Prize: debe sentirse como una infraestructura de confianza habilitada por Google Cloud, no una función de POS.

## Pitch de 30 segundos

> Every product recall system has the same blind spot: it tries to reach the original buyer. But used products have already changed hands. RecallZero is the autonomous safety layer for second-hand commerce. Gemini identifies high-risk products from worn labels, trusted recall events trigger a retroactive inventory sweep, and Google Cloud keeps working across locations until every affected unit is quarantined with auditable evidence. It doesn't send another warning—it proves recalled goods never return to circulation.

## Condiciones go/no-go antes de construir todo

- [ ] Fuente oficial estable: CPSC API.
- [ ] Dataset de power tools con identificadores suficientes.
- [ ] Prototipo de matching exacto con `UNKNOWN` seguro.
- [ ] Evidencia de que el intake real inspecciona esta categoría manualmente.
- [ ] Al menos una conversación o señal de demanda de un operador real.
- [ ] Flujo de cuarentena verificable sin depender de APIs comerciales cerradas.
- [ ] Idempotencia y separación de herramientas demostrables.
- [ ] Evidencia con nonce y aprobación humana.

Si fallan las primeras cuatro condiciones, se debe abandonar o pivotar antes de invertir en UI completa.
