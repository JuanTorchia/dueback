# Resumen operativo de las reglas oficiales

Fuente consultada el 15 de agosto de 2026:

- Página principal: https://allthingsagentichackathon.devpost.com/
- Reglas vinculantes: https://allthingsagentichackathon.devpost.com/rules

Este documento es un resumen de trabajo. Ante cualquier contradicción prevalecen las reglas oficiales.

## Fechas

- Periodo de creación y entrega: 3 de agosto de 2026, 09:00 PT — 31 de agosto de 2026, 17:00 PT.
- Fecha mostrada en UTC: 1 de septiembre de 2026, 00:00 UTC.
- Solicitud de créditos de Google Cloud: antes del 28 de agosto, 12:00 PT, mientras haya disponibilidad.
- Evaluación: 1 de septiembre — 1 de octubre de 2026.
- Anuncio estimado: 8 de octubre de 2026.

## Elegibilidad esencial

- Cada integrante debe ser mayor de edad en su jurisdicción; en Taiwán, tener al menos 20 años.
- Existen países y territorios excluidos, además de restricciones por sanciones y conflictos de interés. Verificar la lista oficial antes de invertir trabajo.
- Se puede participar individualmente, como equipo o como organización.
- Todos los integrantes de un equipo deben ser elegibles y aparecer agregados al proyecto en Devpost.
- Una organización debe designar un representante autorizado.

## Proyecto obligatorio

El proyecto debe ser nuevo y haberse construido durante el periodo del concurso. Se permiten frameworks, librerías, plantillas, open source y asistentes de programación con IA. Debe declararse cualquier código o trabajo preexistente incorporado.

Todos los proyectos deben usar conjuntamente:

1. Gemini 3.5 o superior mediante Gemini API o Vertex AI.
2. Al menos un framework de agentes de Google: ADK, GenAI SDK, Antigravity SDK o GenKit.
3. Al menos un servicio de infraestructura de Google Cloud, por ejemplo Cloud Run, Cloud SQL, Firestore, GKE o Pub/Sub.

El agente debe superar el patrón de chat convencional: ejecutar flujos autónomos en segundo plano, manejar procesos complejos o transformar datos de forma dinámica.

## Categorías

Solo se elige una categoría en la entrega:

- **Taskmaster:** completa un flujo de trabajo real, desordenado y de varios pasos, con mínima intervención humana.
- **Collaborative Partner:** guía al usuario, pide aclaraciones, captura feedback y se adapta; la rúbrica también exige sintetizar o transformar datos complejos, no limitarse a leerlos.
- **Fortified Enterprise Fleet:** red escalable de agentes institucionales con catálogo, estado persistente, seguridad, gobierno, observabilidad y separación clara de responsabilidades.

## Material obligatorio de entrega

- Categoría seleccionada.
- URL del producto alojado, si está disponible; está fuertemente recomendada.
- Descripción de funciones, tecnologías, fuentes de datos y aprendizajes.
- Repositorio público o privado. Si es privado, dar acceso a las dos cuentas indicadas en las reglas.
- README con instrucciones reproducibles para ejecución local o despliegue.
- Diagrama claro de arquitectura.
- Video público en YouTube o Vimeo de hasta cuatro minutos.
- Video y materiales en inglés, o acompañados por traducción/subtítulos en inglés.
- El video debe mostrar el problema, valor, ejecución real y evidencia visible del backend en Google Cloud.
- El proyecto debe seguir disponible gratuitamente para evaluación hasta terminar el periodo de judging.

## Evaluación

Primero existe una fase eliminatoria de viabilidad y cumplimiento. Los proyectos que pasan reciben de 1 a 5 puntos por criterio:

- **40% — Innovación y utilidad operacional:** fricción real eliminada, acción autónoma de alto valor y una característica diferencial clara.
- **30% — Disciplina arquitectónica:** desacoplamiento, estado, memoria, seguridad, aislamiento de herramientas, tolerancia a fallos y recuperación.
- **30% — Demo y preparación para producción:** ejecución en vivo y sin editar, cambios comprobables, documentación reproducible, diagrama y evidencia de Google Cloud.

La página oficial contiene algunos nombres heredados dentro de la explicación arquitectónica (`Continuous Action Engine`, `Evolving Knowledge Engine`, `Multi-Agent Nexus`) que no coinciden literalmente con los tres nombres actuales de categoría. Trataremos esos párrafos como señales técnicas de evaluación, pero usaremos los nombres vigentes al entregar.

## Bonificaciones

- Contenido público explicando el proyecto: hasta +0.2.
- Publicación social con `#AllThingsAgenticHackathon`: hasta +0.2.
- Modelo adicional de Google AI como Gemma, Veo o Lyria: +0.2 por modelo, hasta +0.6.
- Puntuación final máxima declarada: 6.

Las bonificaciones se implementarán después de asegurar el flujo principal y la evidencia de funcionamiento.

## Premios y limitación

El fondo total es de USD 180,000. Hay Grand Prize, premios por categoría, Startup Excellence, Individual/Hobbyist, arquitectura, UX multimodal y menciones honoríficas.

Cada proyecto puede recibir como máximo un premio. Startup Excellence requiere presentarse en nombre de una organización incorporada y usar correo corporativo.

## Propiedad y riesgos

- El equipo conserva la propiedad intelectual, pero concede a Google una licencia amplia para evaluación y promoción según las reglas.
- Debemos poseer o tener autorización para todo código, datos, APIs, imágenes, audio y marcas usados.
- No incluir información personal o confidencial en la demo.
- Los ganadores responden por impuestos, comisiones y formularios aplicables.
