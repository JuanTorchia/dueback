# Prompt maestro para `/speckit.specify`

Construir **DueBack**, un agente personal de seguimiento de promesas comerciales. Las empresas usan
CRM para registrar lo que una persona les debe; DueBack debe hacer lo inverso: permitir que una
persona comparta una promesa que una empresa hizo a su favor —por ejemplo un reembolso aprobado,
un crédito futuro, un reemplazo pendiente o una corrección prometida— y mantener ese caso activo
hasta que exista evidencia suficiente del resultado acordado.

El usuario inicial es una persona no técnica que compra o contrata servicios online y no quiere
recordar plazos, reconstruir conversaciones ni insistir repetidamente. Debe poder comenzar desde un
objeto real: compartir o cargar un email, PDF, imagen, captura o texto, más una frase opcional sobre
el resultado que espera. Para el MVP, la carga móvil/web es obligatoria y el reenvío por email es un
canal adicional que no debe bloquear el flujo principal.

El sistema debe extraer quién prometió qué, el monto u objeto afectado, la fecha o condición, la
referencia del caso y la evidencia futura necesaria. Todo campo incierto debe conservar su
incertidumbre y origen. Antes de actuar, debe mostrar un Plan de resolución entendible con:
resultado esperado; destinatario y acción; información que se compartirá; límites; decisiones que
requieren aprobación; evidencia exacta para terminar; y fecha de expiración. El usuario puede
activar, modificar, rechazar o detener el plan.

Una vez aprobado, DueBack debe mantener estado durante esperas y fallos, despertar el caso al
vencer un plazo o llegar nueva evidencia, realizar únicamente acciones autorizadas y evitar
duplicarlas ante reintentos o eventos repetidos. Solo debe contactar al usuario cuando necesita una
decisión, existe un bloqueo o tiene una resolución verificable.

La experiencia diferenciadora debe demostrar que actividad no equivale a resultado. `We received
your inquiry`, `your request was approved`, `your refund was issued` y `funds were credited` son
niveles distintos. El sistema nunca debe marcar un caso terminado porque envió un seguimiento o
recibió un acuse. Un verificador independiente del modelo debe evaluar la evidencia aprobada. La
demo principal termina en `merchant-confirmed refund`; no debe afirmar acreditación bancaria sin
evidencia independiente.

El primer vertical completo es una promesa de reembolso comercial con monto, moneda, referencia,
plazo y confirmación verificable. Dos manifiestos reducidos deben demostrar reutilización del mismo
modelo de caso: crédito en la próxima factura y reemplazo con tracking. No construir marketplace,
editor de workflows, acceso bancario, navegación web arbitraria, automatización de CAPTCHA,
asesoramiento legal, cancelaciones universales ni compatibilidad mundial declarada.

Debe existir una contraparte controlada claramente rotulada para reproducir estados asíncronos,
fallos, callbacks y duplicados. La interfaz, documentación y demo deben distinguir datos reales,
sintéticos, históricos, sandbox y no implementados. El sandbox demuestra protocolo y recuperación,
no que dinero real llegó a una cuenta.

La persona debe poder inspeccionar una página móvil del caso con objetivo, estado, siguiente paso,
límites, evidencia, timeline, detener, revocar, borrar y `Esto todavía no está resuelto`. No crear un
dashboard como experiencia principal ni un chat vacío.

Incluir requisitos verificables para: entrada duplicada; evidencia ambigua; monto, moneda,
referencia o caso incorrectos; mensaje externo hostil; acción fuera del plan; aprobación vencida;
cambio de plan después de emitir aprobación; fallo recuperable; reintentos agotados; evento
duplicado; reinicio durante la espera; callback inválido; cancelación; expiración; borrado; y
reapertura por el usuario.

El MVP debe poder evaluarse con un corpus publicado de promesas claras, respuestas ambiguas,
promesas incumplidas, fallos, duplicados e inputs hostiles. La métrica primaria es false-DONE rate.
También medir precisión de resolución verificada, acciones duplicadas, acciones no autorizadas
bloqueadas, recuperación tras fallos, intervenciones humanas, tiempo y costo por caso. Estos son
objetivos de evaluación; no inventar resultados.

El producto debe funcionar en inglés para el jurado y aceptar al menos una entrada en español como
prueba de comprensión multilingüe. Debe usar datos personales sintéticos en la demostración,
retención mínima, eliminación controlada y lenguaje honesto sobre el alcance de la evidencia.

Éxito del vertical: una persona puede entregar una promesa, comprender y aprobar sus límites en
menos de tres minutos, observar que una respuesta insuficiente no cierra el caso, sobrevivir a un
fallo/reintento sin acción duplicada y recibir una resolución con evidencia inspeccionable. La
historia completa debe poder demostrarse en menos de cuatro minutos.
