# Torneo final de ideas — recomendación de producto

Fecha: 15 de agosto de 2026.

## Método

Tres auditorías independientes:

1. Problemas humanos, adopción y distribución global.
2. Rúbrica, patrocinador, precedentes de ganadores y diferenciación.
3. APIs, acción real, evidencia y factibilidad solo-founder.

Filtros eliminatorios:

- acción legítima y observable;
- resultado verificable fuera de Gemini;
- Gemini multimodal esencial;
- API/conector autorizado o sandbox honestamente rotulado;
- riesgo no clínico, legal o financiero severo;
- vertical completo en 14 días;
- demo comprensible en menos de cuatro minutos.

## Convergencia

Los tres auditores conservaron el núcleo:

```text
Intake
→ plan aprobado
→ acción autorizada
→ espera/reintento durable
→ evidencia determinista
→ Proof of Done
```

La discusión no es si conservar `Proof of Done`; es cuál problema visible debe transportarlo.

## Candidatos principales

| Candidato                  | Fortaleza                                             | Debilidad fatal                                      | Techo estimado |
| -------------------------- | ----------------------------------------------------- | ---------------------------------------------------- | -------------: |
| **DueBack**                | Promesa singular, amplia y memorable; Gemini esencial | Puede parecer follow-up de Gmail; resolución sandbox |     **4.71/5** |
| **RecallZero**             | Fuente oficial, multimodalidad y demo técnica densa   | Baja frecuencia y alcance geográfico                 |     **4.59/5** |
| **DoneFlow plataforma**    | Arquitectura horizontal potente                       | Abstracta y cercana a builders existentes            |     **4.39/5** |
| Purchase/Parcel Resolution | Dolor masivo y cambio económico claro                 | No existe API universal de comercios/carriers        |   4.2/5 aprox. |
| ErrandPilot                | APIs reales de Maps/Calendar y ejecución segura       | Organiza; no completa el trabajo físico              |   3.8/5 aprox. |
| Subscription Exit          | Historia y monetización claras                        | Saturado; cancelaciones sin API común                |         3.97/5 |

También fueron descartados: turnos universales, viajes, formularios oficiales, alergias, acceso bancario, cancelación arbitraria, paquetes multi-carrier, cuidado clínico y food waste. Fallan por APIs, riesgo, cierre o plazo.

## Recomendación: DueBack

> **Companies use CRMs to track everything you owe them. DueBack is the reverse CRM for people.**

> DueBack finds what companies promised you, acts when they fail to deliver, and keeps working until there is proof that your refund, credit, replacement, or fix actually arrived.

### Por qué supera al DoneFlow visible

- Tiene un usuario y objeto claros: una promesa comercial a favor de la persona.
- Es amplia sin significar “cualquier tarea”.
- Funciona con reembolsos, créditos, reemplazos, devoluciones y correcciones.
- La entrada natural es compartir o reenviar el mensaje donde nació la promesa.
- La espera y reanudación son inherentes, no arquitectura decorativa.
- Gemini debe interpretar lenguaje ambiguo y evidencia posterior.
- `Proof of Done` pasa de idea técnica a beneficio entendible.

DoneFlow permanece como nombre interno del runtime; no se explican dos marcas durante el pitch.

## Producto

Una persona comparte o reenvía:

- `Refund approved; allow 5–10 business days.`
- `We will apply a credit on your next bill.`
- `Your replacement will ship within 72 hours.`
- `We waived the fee.`
- `We will contact you by Friday.`

Gemini extrae un `Promise Contract`:

- quién prometió;
- qué resultado;
- importe/objeto;
- fecha o condición;
- evidencia necesaria;
- acciones y límites autorizados.

DueBack despierta el caso cuando corresponde, comprueba evidencia, hace seguimiento aprobado y no cierra por una respuesta meramente administrativa.

## Demo decisiva

1. Se reenvía un email: reembolso de USD 79 aprobado en cinco días.
2. Gemini extrae la promesa con provenance.
3. La persona aprueba destinatario, datos, plazo y escalación.
4. Cloud Tasks despierta el caso al vencer el plazo.
5. No existe confirmación suficiente; se envía seguimiento real/controlado.
6. La contraparte responde `we received your inquiry`.
7. DueBack rechaza `DONE`.
8. Un redelivery no envía un segundo mensaje.
9. Llega `refund issued` con monto, moneda, referencia y firma.
10. El verifier satisface el contrato y muestra Proof of Done.

## Honestidad de evidencia

Separar explícitamente:

```text
PROMISE_RECORDED
→ REQUEST_ACKNOWLEDGED
→ MERCHANT_COMMITTED
→ MERCHANT_CONFIRMED
→ FUNDS_SETTLED (fuera del MVP salvo evidencia independiente)
```

Un sandbox puede probar contratos HTTP, estados, firmas, callbacks, fallos e idempotencia. No prueba que dinero real llegó a una cuenta. Nunca afirmar lo contrario.

## Tecnología

- Gemini 3.5+ para promesas, contradicciones, multilingüe y provenance.
- Framework recomendado sujeto al spike: Genkit mantiene un solo stack TypeScript; ADK ofrece narrativa/evaluación agentic más explícita.
- Cloud Run.
- Firestore.
- Cloud Tasks.
- Action Broker y Evidence Verifier deterministas.
- Email forwarding y web upload; sin lectura completa de Gmail.
- Structured Logging con `run_id`.

No se congela ADK versus Genkit hasta realizar un spike corto de trayectoria/evaluación y despliegue. No se usarán ambos.

## Riesgos de rechazo

- Parece un asistente de follow-up de Gmail.
- El sandbox crea y certifica circularmente el resultado.
- Solo genera borradores.
- Gemini controla `DONE`.
- Cada promesa exige lógica específica.
- Las reglas por país dominan el producto.
- Cada paso necesita aprobación humana.
- Se promete dinero recuperado sin evidencia.

## Kill test

En 48 horas debe existir un walking skeleton desplegado:

- entrada real por upload; email si no amenaza el plazo;
- diez mensajes variados extraídos con provenance;
- distinción entre recepción, aprobación, emisión y acreditación;
- Promise Contract aprobado y versionado;
- Cloud Task con redelivery;
- acción HTTP externa/controlada idempotente;
- respuesta insuficiente rechazada;
- callback firmado y evidencia correcta aceptada;
- persistencia después de redeploy;
- timeline y logs correlacionados.

### GO DueBack

La historia completa funciona, se entiende en una frase y Gemini aporta valor observable.

### Pivot RecallZero

OAuth/email o las reglas comerciales consumen el plazo, la resolución parece circular, el flujo termina en un borrador o la evidencia depende de Gemini.

### Pivot ErrandPilot

Si se prioriza máxima seguridad de entrega y APIs reales, aceptando menor diferenciación.

## Resultado

**Recomendación provisional: construir DueBack como producto y DoneFlow como motor interno, sujeto al kill test de 48 horas.**

No abrir otra ronda de ideación salvo que el kill test produzca evidencia de pivot.

## Fuentes primarias seleccionadas

- Ganadores ADK: https://cloud.google.com/blog/products/ai-machine-learning/adk-hackathon-results-winners-and-highlights
- Ganadores Gemini Live: https://cloud.google.com/blog/topics/developers-practitioners/winners-and-highlights-of-the-gemini-live-agent-challenge
- Gemini Enterprise Agent Platform: https://docs.cloud.google.com/gemini-enterprise-agent-platform/agents
- CFPB Consumer Credit Card Market Report: https://files.consumerfinance.gov/f/documents/cfpb_consumer-credit-card-market-report_2025-12.pdf
- OECD e-commerce consumer detriment: https://www.oecd.org/en/publications/measuring-financial-consumer-detriment-in-e-commerce_4055c40e-en.html
- OECD dark patterns: https://www.oecd.org/en/about/news/press-releases/2024/10/stronger-consumer-protections-needed-to-address-current-and-emerging-harms-consumers-face-online.html
- Gmail API policies: https://developers.google.com/workspace/workspace-api-user-data-developer-policy
- Calendar idempotent event IDs: https://developers.google.com/workspace/calendar/api/guides/create-events
- CPSC recalls API: https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information
