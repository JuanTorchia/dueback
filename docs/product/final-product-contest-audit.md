# Auditoría final de producto y concurso — DoneFlow

Fecha: 15 de agosto de 2026.

## Panel

- Jurado severo del concurso y Google Cloud.
- CPO de producto consumer/global.
- CTO/solo-founder y jurado técnico.

## Veredicto conjunto

**GO condicionado a un kill test de 48 horas.**

- Continuar con `Proof of Done` y Purchase Rescue.
- No construir plataforma, marketplace ni tres integraciones completas.
- Presentar el producto como `share-first, channel-return`; email y carga móvil son los dos adapters P0.
- Si email resulta inestable pero el runtime funciona, pivotar a web/share-first.
- Si no existe ejecución durable, evidencia independiente o valor observable de Gemini, pivotar a RecallZero.

## Puntuación del jurado

| Estado                              | Innovación/utilidad 40% |              Arquitectura 30% | Demo/producción 30% |             Total |
| ----------------------------------- | ----------------------: | ----------------------------: | ------------------: | ----------------: |
| Concepto actual, sin implementación |                   3.4/5 | 3.5 conceptual; 1 verificable |               1.0/5 | 2.71/5 conceptual |
| Techo con ejecución excelente       |                   4.6/5 |                         4.8/5 |               4.7/5 |            4.69/5 |

No hay base honesta para prometer un 5/5. Sí existe techo de finalista fuerte y ganador de categoría si la ejecución es impecable.

## Fortaleza singular

> DoneFlow no permite que un agente confunda actividad con resultado: mantiene el caso vivo hasta que evidencia verificable satisface un plan aprobado.

El momento diferenciador:

1. Gemini entiende `We received your refund request`.
2. El verifier determina `REQUEST_ACKNOWLEDGED`, no `REFUND_CONFIRMED`.
3. El run permanece activo.
4. Sobrevive a espera, fallo y redelivery.
5. Un callback firmado con referencia y monto correctos permite `DONE`.

## Principales razones de rechazo

1. Purchase Rescue solo redacta o envía email y no resuelve nada.
2. `Proof of Done` es una etiqueta controlada por Gemini.
3. Gemini procesa documentos perfectos y resulta reemplazable por reglas.
4. Genkit es únicamente wrapper de una llamada.
5. Cloud Tasks y Firestore existen solo en el diagrama.
6. Inbox-first parece otro asistente de correo.
7. El sandbox se presenta ambiguamente como comercio real.
8. Las recetas secundarias son tarjetas estáticas o runtimes separados.
9. Cada paso requiere aprobación y elimina autonomía.
10. La propuesta promete cobertura mundial sin paquetes locales.

## Corrección de forma de producto

Identidad recomendada:

> Share or forward what is unresolved. DoneFlow agrees on the limits, keeps the case alive, and returns with a decision request, a blocker, or proof it is done.

- `Share-first` es la visión: foto, PDF, captura, mensaje, email o enlace más una frase.
- `Email forwarding` es un adapter P0 excelente para compras online, no la identidad universal.
- `Mobile upload` es el segundo adapter P0 y fallback completo.
- `Channel-return`: la respuesta vuelve por el canal original.
- WhatsApp continúa como visión/adaptador futuro, no dependencia del hackathon.

## Riesgo de evidencia

La demo no prueba que el dinero se acreditó en una cuenta bancaria. Solo puede declarar honestamente:

```text
REQUEST_ACCEPTED
→ MERCHANT_APPROVED
→ FUNDS_SETTLED (fuera del MVP)
```

El contrato demo debe terminar en `MERCHANT_APPROVED`, validando:

- estado esperado;
- monto y moneda;
- referencia de transacción;
- `merchant_request_id`;
- timestamp;
- firma válida.

La UI dirá `Merchant-confirmed refund`, no `Money returned to your account`.

## Kill test de 48 horas

Debe existir desplegado, aunque sea feo:

```text
email o upload real
→ IntakeEnvelope único en Firestore
→ extracción tipada con Gemini/Genkit
→ revisión móvil y aprobación versionada
→ Cloud Task
→ Action Broker
→ Merchant Sandbox devuelve REQUEST_RECEIVED
→ verifier rechaza DONE
→ retry/callback firmado REFUND_APPROVED
→ verifier valida referencia y monto
→ DONE
→ notificación final + timeline/logs con run_id
```

Pruebas obligatorias:

- entrada duplicada crea un solo caso;
- doble delivery crea una sola solicitud;
- callback sin firma no cambia estado;
- `REQUEST_RECEIVED` nunca cierra;
- monto incorrecto se rechaza;
- web upload funciona sin email;
- redeploy/reinicio no pierde el run.

## Regla de decisión después de 48 horas

### GO DoneFlow

Cadena completa desplegada, Gemini aporta interpretación observable y el resultado cabe en cuatro minutos.

### Pivot web/share-first

Runtime, aprobación, retry y evidencia funcionan, pero email inbound/outbound sigue inestable.

### Pivot RecallZero

Purchase Rescue es circular o superficial, el verifier depende de Gemini, no existe acción/reanudación real o Gemini podría eliminarse sin cambiar la demo.

### NO-GO DoneFlow

Después de 48 horas solo existen schemas, mockups y llamadas aisladas.

## Validación consumer paralela

Concierge de 72 horas con ocho personas no técnicas. Ofrecer `borrador gratis` versus `seguimiento delegado` y observar una elección real.

GO de producto si:

- 6/8 entregan un caso sin ayuda;
- 5/8 eligen delegación;
- 4/8 aceptan precio o reserva simbólica;
- 6/8 comprenden límites y evidencia;
- 5/8 permiten una acción externa aprobada;
- menos de 2/8 quieren aprobar cada paso trivial.

Estos números son umbrales futuros, no resultados actuales.

## Conclusión

El proyecto merece exactamente 48 horas de construcción vertical. No se autoriza pulir marca, marketplace, segunda receta o arquitectura adicional antes de superar el kill test.
