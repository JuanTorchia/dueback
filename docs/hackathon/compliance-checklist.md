# Lista de cumplimiento

Marcar únicamente con evidencia verificable.

## Equipo y registro

- [x] Residencia declarada: Argentina, no excluida por las reglas publicadas.
- [x] Edad declarada: 36 años; cumple el requisito de mayoría de edad.
- [x] Se confirmó que no se participa mediante una empresa constituida; Startup Excellence queda descartado.
- [ ] El participante confirma no estar alcanzado por sanciones ni conflictos de interés de las reglas.
- [x] El participante está registrado en Devpost y unido al hackathon; Devpost mostró confirmación el 15 de agosto de 2026.
- [x] Se decidió participación individual; no se requiere representante de equipo.
- [x] Se solicitó crédito de Google Cloud el 15 de agosto de 2026; Google Forms confirmó la recepción. Pendiente de aprobación, con hasta 72 horas hábiles de procesamiento.

## Producto

- [x] El trabajo concursante comenzó dentro del periodo permitido. Evidencia: [registro de procedencia](../compliance/dependencies.md).
- [x] Se documentó cualquier componente preexistente. Evidencia: [registro de procedencia](../compliance/dependencies.md); no se incorporó una app preexistente.
- [x] Se seleccionó exactamente una categoría: Taskmaster. Evidencia: [README](../../README.md).
- [x] Usa Gemini 3.5 o superior. Evidencia: `gemini-3.5-flash` en [flujo Genkit](../../packages/genkit-flows/src/extract-promise.ts).
- [x] Usa Genkit. Evidencia: [decisión D-010](../decisions/decision-log.md) y dependencias fijadas.
- [x] Usa infraestructura de Google Cloud. Evidencia: [arquitectura](../architecture/dueback.md) y [deploy reproducible](../../infra/cloud-run/deploy.sh).
- [x] Ejecuta acciones autónomas más allá de responder en un chat. Evidencia: [walking skeleton](../../tests/e2e/refund-walking-skeleton.spec.ts).
- [x] Tiene estado y recuperación ante fallos demostrable. Evidencia: [pruebas de durabilidad](../../tests/integration/durable-follow-through.test.ts).
- [x] Los canales declaran capacidades y salud reales; uno no disponible no puede aprobarse. Evidencia: `channel-registry.test.ts`, `plan-controller.test.ts` y `channel-plan.spec.ts`.
- [x] Email administrado tiene envío controlado real, webhook firmado, procesamiento inbound y
  rechazo false-DONE. No se afirma soporte arbitrario ni resolución del resultado. Evidencia:
  `email-webhook.test.ts`, `email-inbound.test.ts`, `deployed-managed-email.spec.ts` y el registro
  redactado en `docs/evaluation/reproducibility.md`.
- [x] APIs, datos y activos implementados tienen autorización/licencia documentada. Evidencia: [registro](../compliance/dependencies.md).
- [x] Funciona en inglés como mínimo y procesa un fixture español. Evidencia: [fixtures](../../packages/test-fixtures/src/promises.ts).

## Evidencia y entrega

- [x] Aplicación alojada e instrucciones de acceso para jueces. Evidencia: [README](../../README.md#judge-access).
- [x] Acceso gratuito sin credenciales pagas ni datos personales; se mantendrá disponible durante la evaluación. Evidencia: URL pública y Firebase anonymous en [README](../../README.md#judge-access).
- [ ] Repositorio accesible para los jueces.
- [x] README con instalación y ejecución reproducibles. Evidencia: [README](../../README.md#local-setup).
- [x] Diagrama de arquitectura actualizado. Evidencia: [arquitectura](../architecture/dueback.md).
- [x] Descripción de funciones, tecnologías, datos y limitaciones. Evidencia: [README](../../README.md).
- [ ] Video público de máximo cuatro minutos.
- [ ] Video en inglés o con subtítulos en inglés.
- [ ] Video muestra ejecución real sin editar.
- [ ] Video muestra resultados observables: logs, cambios en datos o UI.
- [ ] Video muestra evidencia de despliegue/backend en Google Cloud.
- [ ] Si se muestra email como real, Gates A–C incluyen remitente/dominio/mailbox controlados y evidencia redactada; de otro modo el video conserva sandbox.
- [ ] Entrega final antes del 31 de agosto, 17:00 PT.

## Bonificación

- [ ] Artículo, podcast o video público con la declaración exigida.
- [ ] Publicación social con `#AllThingsAgenticHackathon`.
- [ ] Integración adicional de Google AI probada y relevante.
