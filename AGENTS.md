# Instrucciones compartidas para asistentes de IA

Este repositorio es el espacio común de un equipo que participa en All Things Agentic Hackathon 2026. Estas instrucciones aplican a Codex/ChatGPT, Claude, Gemini y cualquier otro asistente.

## Objetivo

Construir un proyecto nuevo, demostrable y competitivo que maximice la rúbrica oficial, no solamente un prototipo técnicamente interesante.

## Antes de cambiar el proyecto

1. Leer `README.md`.
2. Leer `docs/hackathon/rules-summary.md` y `docs/hackathon/compliance-checklist.md`.
3. Revisar `docs/decisions/decision-log.md`; no revertir decisiones aceptadas sin documentar el motivo.
4. Conservar el trabajo de otros asistentes y evitar reescrituras amplias innecesarias.

## Reglas de construcción

- El producto debe ejecutar acciones autónomas; una interfaz de chat por sí sola no es suficiente.
- La arquitectura debe reservar desde el inicio Gemini 3.5 o superior, un framework de agentes de Google y al menos un servicio de infraestructura de Google Cloud.
- Claude y ChatGPT/Codex pueden ayudar a investigar, diseñar y programar, pero el producto presentado debe cumplir la tecnología obligatoria de Google.
- No inventar métricas, pruebas, integraciones ni evidencia de despliegue.
- Registrar las decisiones irreversibles o importantes en `docs/decisions/decision-log.md`.
- Mantener instrucciones reproducibles y dependencias fijadas cuando comience el desarrollo.
- Nunca guardar claves o tokens. Usar archivos `.env.example` sin valores reales.
- Señalar cualquier uso de código o activos preexistentes; el proyecto concursante debe haber sido creado durante el periodo permitido.
- Usar únicamente datos, APIs y recursos con autorización y licencias compatibles.

## Criterio de terminado

Una funcionalidad no está terminada hasta que tiene una ruta demostrable, manejo explícito de errores, una forma de verificar el resultado y documentación suficiente para reproducirla.
