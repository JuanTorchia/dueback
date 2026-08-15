# Forma de producto y distribución — DoneFlow

Fecha: 15 de agosto de 2026.

## Decisión

> **Superado para P0 por D-009 (2026-08-15)**: este documento conserva la visión de canales, pero
> el kill test es `upload/paste-first`. Inbound email se evalúa únicamente después del núcleo
> desplegado.

DoneFlow busca ser **share-first, link-second**:

> Forward it to DoneFlow. Approve what it may do. Receive proof when it is done.

No será un dashboard para administrar agentes. Será un destinatario al que la persona entrega algo inconcluso y que vuelve por el mismo canal únicamente cuando necesita una decisión, encuentra un bloqueo o puede demostrar el resultado.

## Experiencia P0

1. La persona reenvía un email, recibo o hilo a un alias opaco de DoneFlow.
2. DoneFlow responde en el mismo hilo con el resultado entendido, los límites y la evidencia necesaria.
3. Un enlace firmado abre directamente la revisión móvil: `Activar`, `Cambiar límites` o `No es esto`.
4. DoneFlow trabaja en segundo plano.
5. La persona recibe email solo ante decisión, bloqueo o cierre con prueba.
6. El link del caso muestra evidencia, timeline, detener, revocar, borrar y `No está resuelto`.

La web es superficie puntual de consentimiento y evidencia, no destino cotidiano. No se construyen home de métricas, sidebar, marketplace ni editor visual.

## Canales

| Prioridad           | Canal                      | Estado                                        |
| ------------------- | -------------------------- | --------------------------------------------- |
| P0                  | Reenvío de email           | Ingesta y retorno reales                      |
| P0                  | Carga web móvil            | Fallback real y reproducible                  |
| P1                  | Telegram                   | Adaptador real solo si P0 está estable        |
| P1                  | PWA Share Target           | Experimental; compatibilidad desigual         |
| Futuro              | WhatsApp                   | Contrato y fixtures, no integración prometida |
| Fuera del hackathon | SMS, app nativa, extensión | No construir                                  |

WhatsApp es el siguiente gran canal de la visión, pero no será dependencia del hackathon por onboarding empresarial, plantillas, ventanas de conversación, costos y riesgo de aprobación externa.

No se pedirá acceso completo a Gmail. El reenvío manual entrega solo el caso elegido y reduce el salto de confianza.

## Arquitectura portable

```text
Email / Web / Telegram / WhatsApp
                ↓
          Channel Adapter
                ↓
          Intake Gateway
                ↓
      Normalized IntakeEnvelope
                ↓
        DoneFlow Core Runtime
                ↓
      Notification Dispatcher
                ↓
       canal original + link seguro
```

Los adapters transportan mensajes y nunca conocen las reglas de Purchase Rescue.

```ts
interface ChannelAdapter {
  authenticate(request: Request): Promise<AuthenticatedWebhook>;
  normalize(input: AuthenticatedWebhook): Promise<IntakeEnvelope[]>;
  deliver(output: DeliveryEnvelope): Promise<DeliveryReceipt>;
}
```

La deduplicación usa `channel + externalMessageId`, nunca contenido interpretado por Gemini.

## Email P0

```text
MX del subdominio
→ proveedor inbound con webhook firmado
→ Cloud Run Intake Gateway
→ validación y almacenamiento privado del adjunto
→ evento Firestore
→ Cloud Task
```

El proveedor se elegirá después de probar recepción, firma, adjuntos, latencia y costo. No se construirá un servidor SMTP.

Identidad y seguridad:

- magic link, sin contraseña inicial;
- alias opaco, rotatorio y revocable;
- el alias identifica, pero no autoriza acciones sensibles;
- links firmados, de un uso y con vencimiento;
- aprobación inválida si cambia el contrato;
- firma, timestamp y event ID en webhooks;
- límites de tamaño, MIME y frecuencia;
- PDF, JPEG, PNG y texto como formatos iniciales;
- logs sin cuerpo del email ni datos personales;
- URLs firmadas y retención corta documentada;
- datos sintéticos durante la demo.

## Visión mundial

El producto será **channel-portable**, no literalmente compatible con todos los proveedores y países desde el primer día.

Promesa futura:

> Whatever channel life uses, hand the unfinished thing to DoneFlow and get back proof when it is handled.

El hábito buscado es `capturar y soltar`, no conversar ni revisar un panel. Después de validar email y web: WhatsApp, share sheet, planes familiares, paquetes locales y conectores de alcance mínimo.

## Distribución y negocio futuro

- Páginas por problema concreto, no por tecnología.
- Analizar un recibo y mostrar el Plan de resolución antes de pedir registro.
- Dirección fácil de recordar y alias personal.
- Resultado anonimizable y compartible, nunca datos sensibles.
- Freemium por casos activos; luego plan personal y familiar.
- Tarifa fija para casos complejos, no porcentaje de recupero inicialmente.
- B2B2C futuro sin vender datos ni permitir que patrocinadores controlen decisiones.

## Definition of Done del canal

- Un email real produce exactamente un `IntakeEnvelope`.
- El email duplicado no crea otro run.
- Un remitente falsificado no aprueba acciones.
- Un adjunto inválido se rechaza con explicación.
- Revisión y aprobación funcionan desde móvil.
- Resultado y evidencia regresan por email.
- Carga web usa la misma receta sin cambiar el runtime.
- Existe fallback web para la grabación.
- Al menos otro adapter pasa contract tests.
- README declara proveedores, costos, fixtures y limitaciones.

## Referencias técnicas

- Gmail push y Cloud Pub/Sub: https://developers.google.com/workspace/gmail/api/guides/push
- Scopes de Gmail: https://developers.google.com/workspace/gmail/api/auth/scopes
- Verificación de scopes restringidos: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
- Web Share Target y compatibilidad: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
