# Estrategia de evaluación y encaje con Google

Fecha de investigación: 15 de agosto de 2026.

## Quién evaluará

Las reglas no publican nombres individuales. Indican que Google y Devpost pueden usar paneles de expertos, revisión por pares, análisis automatizado con IA o una combinación, y que los jueces pueden ser empleados del patrocinador o terceros.

Implicación: no debemos optimizar para la biografía de una persona. Debemos construir una entrega que funcione para tres lectores probables:

1. **Filtro de cumplimiento:** busca requisitos completos, categoría clara y tecnología obligatoria.
2. **Juez de producto:** debe comprender problema, usuario, acción y valor en los primeros 30–45 segundos.
3. **Juez técnico de Google Cloud:** debe ver por qué ADK/Gemini/Cloud son necesarios, no una lista decorativa de servicios.

Fuente: https://allthingsagentichackathon.devpost.com/rules

## Lo que realmente puntúa este evento

### 40% — Resultado autónomo

El protagonista de la demo no debe ser el prompt. Debe ser un cambio externo verificable: un caso creado, un mensaje enviado, un estado actualizado, una reparación solicitada o una excepción correctamente escalada.

### 30% — Sistema durable y seguro

El diagrama y la ejecución deben probar:

- separación entre razonamiento y herramientas;
- permisos mínimos;
- estado persistente;
- reintentos e idempotencia;
- evidencia y trazabilidad;
- recuperación frente a una herramienta caída o respuesta ambigua;
- aprobación humana para acciones inciertas o irreversibles.

### 30% — Prueba difícil de negar

El organizador confirmó en Discussions que una ejecución real puede acelerarse uniformemente, siempre que sea una sola toma, sin cortes ni empalmes, con una nota visible indicando la aceleración. Diseñaremos un flujo completo que pueda ejecutarse en una toma.

Fuente: https://allthingsagentichackathon.devpost.com/forum_topics/44809-demo-video-is-speeding-up-the-whole-recording-allowed-under-unedited

## Qué quiere demostrar Google

La narrativa oficial de Gemini Enterprise Agent Platform no es “mejor chatbot”. Es pasar de tareas aisladas a **delegar resultados de negocio con confianza**.

Los productos que Google está impulsando se agrupan en:

- **Build:** Gemini + ADK para agentes y subagentes especializados.
- **Scale:** Agent Runtime para procesos de días y Memory Bank para contexto persistente.
- **Govern:** Agent Identity, Agent Gateway, IAM y Model Armor.
- **Optimize:** simulación, evaluación, observabilidad y trazas.

Google enfatiza procesos multietapa y de larga duración, memoria que sobrevive sesiones, identidad del agente, acceso de mínimo privilegio, protección frente a prompt injection/tool poisoning/fugas y auditoría centralizada.

Fuentes oficiales:

- https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform
- https://cloud.google.com/blog/products/ai-machine-learning/whats-new-in-gemini-enterprise-agent-platform
- https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development
- https://cloud.google.com/blog/products/ai-machine-learning/13-demos-on-gemini-enterprise-agent-platform

## Patrones observados en ganadores recientes de Google Cloud

Una revisión de proyectos ganadores del Google Cloud Rapid Agent Hackathon 2026 muestra patrones útiles:

- dominio específico, no asistente universal;
- eventos y cambios en tiempo real;
- agentes con responsabilidades claras;
- resultado visible en mapa, panel, trazas o sistema externo;
- despliegue real en Cloud Run/Agent Engine;
- fallos, recuperación y estado mencionados explícitamente;
- métricas o pruebas reproducibles;
- uso del modelo para una tarea difícil, no solo generación de texto.

Ejemplos:

- KickOff, coordinación de multitudes con agentes por corredor: https://devpost.com/software/trustos
- Zero Day Forensic Investigator, investigación de incidentes: https://devpost.com/software/zero-day-forensic-investigator
- Heimdall, respuesta autónoma a incidentes: https://devpost.com/software/project-hpfwsu51xila
- Sentinel Flood-Watch, vigilancia de inundaciones: https://devpost.com/software/sentinel-flood-watch-agent

Esto no demuestra una fórmula universal, pero sí una preferencia por operaciones observables y sistemas especializados frente a wrappers conversacionales.

## Evaluación estratégica de RecallGuard

RecallGuard encaja especialmente bien con la narrativa de Google si se formula como un **agente durable de resolución**, no como una aplicación de búsqueda de recalls.

| Mensaje de Google    | Demostración de RecallGuard                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Delegar un resultado | “Mantén mi hogar libre de productos retirados y completa el remedio.”                           |
| Larga duración       | Monitorea productos durante meses y sigue casos hasta su cierre.                                |
| Gemini multimodal    | Lee etiquetas, números de serie, recibos, fotos y avisos no estructurados.                      |
| Estado/memoria       | Recuerda inventario, miembros del hogar, evidencia, decisiones y estado del remedio.            |
| Eventos              | Un aviso oficial activa el flujo sin que el usuario pregunte.                                   |
| Seguridad            | Desconfía de instrucciones externas, limita herramientas y exige aprobación ante incertidumbre. |
| Observabilidad       | Cada comparación, decisión, acción y reintento aparece en una línea temporal auditable.         |
| Producción           | Cloud Run + Pub/Sub + Firestore/Agent Runtime prueban ejecución real y escalable.               |

## El giro ganador

“Recall alert” es una notificación. **RecallGuard cierra el ciclo.** Convierte evidencia desordenada en inventario, detecta coincidencias exactas, resiste avisos maliciosos, ejecuta el remedio permitido y no termina hasta que el producto fue reparado, reemplazado o descartado con seguridad.

Este giro debe quedar claro en una frase:

> Most recall systems broadcast warnings. RecallGuard knows what you own and safely finishes the fix.

## Riesgo de sobrearquitectura

No debemos usar múltiples agentes solo para impresionar. Para Taskmaster basta una arquitectura clara:

- coordinador ADK;
- herramienta de extracción multimodal;
- herramienta de fuentes oficiales;
- herramienta de resolución/comunicación;
- política determinista de riesgo y aprobación;
- estado durable y trazas.

Si cada componente no cambia el resultado o la recuperación, se elimina.

## Texto recomendado para solicitar créditos

**Track: The Taskmaster**

> RecallGuard is a long-running household safety agent that turns receipts and product-label photos into a private inventory, continuously matches it against official recall feeds, and autonomously carries each verified recall from notification through repair, replacement, or safe disposal. Gemini 3.5 Flash provides multimodal identification and grounded decision-making, while Google ADK and Google Cloud provide event-driven, durable execution with audit trails and human approval for uncertain or irreversible actions.

La idea declarada en el formulario puede cambiar posteriormente, según el propio formulario. No enviar hasta que el participante apruebe este posicionamiento.
