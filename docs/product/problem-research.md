# Investigación de problemas y oportunidades

Fecha de investigación: 15 de agosto de 2026.

Objetivo: encontrar un problema extendido que permita demostrar acción autónoma, arquitectura seria y un resultado inequívoco en menos de cuatro minutos.

## Evidencia encontrada

### 1. Administración de cuidados familiares

- Una revisión reciente sobre cuidadores informa que programar citas, completar formularios, manejar facturas, seguros, suministros y traslados son cargas frecuentes. En uno de los estudios incluidos, 83% ayudaba con programación o papeleo médico.
- La fragmentación entre proveedores, aseguradoras y servicios obliga a los cuidadores a coordinar información manualmente.
- La OMS señala que el envejecimiento incrementa la demanda de cuidados y que muchos países dependen de familiares y comunidades.

Fuentes:

- https://pmc.ncbi.nlm.nih.gov/articles/PMC13275011/
- https://wkc.who.int/resources/publications/m/item/long-term-care-in-ageing-populations

### 2. Retiros de productos y seguridad del consumidor

- La FDA indica que más de 83,000 productos regulados fueron retirados entre 2014 y 2024.
- Para comprobar un retiro, el consumidor debe comparar manualmente marca, tamaño, modelo, lote, vencimiento y otros identificadores.
- CPSC define la efectividad de un retiro como lograr que el consumidor sea notificado y actúe; mantiene décadas de información mediante una API pública.
- Informes de CPSC muestran una brecha entre productos vendidos, consumidores notificados y acciones correctivas.

Fuentes:

- https://www.fda.gov/consumers/consumer-updates/fda-101-product-recalls
- https://www.fda.gov/about-fda/open-government-fda-data-sets/recalls-data-sets
- https://www.cpsc.gov/Recall-Effectiveness
- https://www.cpsc.gov/Data

### 3. Administración para trabajadores independientes y pequeñas empresas

- Un panel representativo de KfW encontró un promedio de 32 horas mensuales por empresa dedicado a requisitos administrativos; los trabajadores por cuenta propia sufrían la mayor carga relativa.
- La evidencia sobre Latinoamérica muestra cargas importantes de trámites, pagos internacionales tardíos y poca visibilidad.

Fuentes:

- https://www.kfw.de/About-KfW/Newsroom/Latest-News/Pressemitteilungen-Details_847424.html
- https://www.mastercard.com/news/latin-america/en/newsroom/press-releases/pr-en/2025/july/modernizing-cross-border-payments-new-mastercard-study-reveals-the-path-to-strengthening-smes-success-in-latin-america-and-the-caribbean/

### 4. Búsqueda de empleo

- Encuestas de 2025 describen fatiga, procesos repetitivos y mucho tiempo para adaptar cada postulación.
- Sin embargo, ya existen numerosos asistentes de CV, autofill y postulaciones automáticas. El espacio tiene baja diferenciación y riesgo de incentivar aplicaciones indiscriminadas.

Fuentes:

- https://www.aerotek.com/en/insights/2025-job-seeker-survey-finding-jobs-faster-higher-confidence
- https://pages.lever.co/rs/659-JST-226/images/2025-Job-Seeker-Nation-Report.pdf

### 5. Reclamos y derechos del consumidor

- La Comisión Europea informa que los compradores online tienen más de 60% de probabilidad adicional de experimentar problemas frente a compradores offline.
- La ruta completa —encontrar recibo, interpretar política, contactar, seguir plazos y escalar— es apta para un agente, pero las reglas legales varían por jurisdicción.

Fuente:

- https://commission.europa.eu/strategy-and-policy/policies/consumers/consumer-protection-policy/key-consumer-data_en

## Puntuación preliminar

Escala de 1 a 5; total ponderado según `idea-scorecard.md`.

| Idea                                                     | Categoría  | Impacto | Autonomía | Diferenciación | Demo | Arquitectura | Plazo | Datos | Multimodal |    Total |
| -------------------------------------------------------- | ---------- | ------: | --------: | -------------: | ---: | -----------: | ----: | ----: | ---------: | -------: |
| **RecallGuard — del recibo a la reparación**             | Taskmaster |     4.5 |       4.7 |            4.6 |  4.9 |          4.7 |   4.5 |   4.8 |        4.8 | **4.67** |
| **CareRelay — coordinador para cuidadores**              | Taskmaster |     5.0 |       4.3 |            4.5 |  4.6 |          4.7 |   3.3 |   3.4 |        4.7 | **4.36** |
| **SoloOps — administración y cobro para independientes** | Taskmaster |     4.5 |       4.7 |            3.4 |  4.5 |          4.4 |   4.5 |   4.1 |        2.5 | **4.24** |
| **ClaimPilot — reclamos de consumo**                     | Taskmaster |     4.4 |       4.6 |            3.9 |  4.5 |          4.2 |   3.8 |   3.5 |        4.0 | **4.18** |
| **JobFlow — postulaciones laborales**                    | Taskmaster |     4.8 |       4.5 |            2.0 |  4.0 |          3.4 |   4.3 |   3.3 |        2.5 | **3.72** |

Las puntuaciones son hipótesis de producto, no métricas verificadas. Deben revisarse después de validar usuarios y factibilidad técnica.

## Recomendación provisional inicial: RecallGuard

> **Estado posterior:** una auditoría multiagente y el análisis de competencia demostraron que la versión doméstica tiene baja diferenciación. Consultar `multi-agent-jury-audit.md`; la recomendación actual para validar es **SecondLife Safety**.

### Problema

Las personas no saben qué productos de su hogar fueron retirados, deben comparar identificadores difíciles y luego completar manualmente el remedio. Las alertas masivas generan ruido; lo necesario es identificar exactamente qué posee cada persona y terminar la acción correctiva.

### Flujo autónomo

1. El usuario reenvía recibos, correos o toma fotos de etiquetas y números de serie.
2. Gemini extrae producto, modelo, lote y otros identificadores multimodales.
3. El agente mantiene un inventario privado y monitorea fuentes oficiales mediante eventos programados.
4. Al aparecer un retiro, cruza identificadores y evidencia, asigna confianza y severidad.
5. Si el caso es inequívoco, inicia el remedio permitido: prepara el reclamo, contacta al fabricante, solicita kit/reparación o crea instrucciones de devolución.
6. Si existe ambigüedad o riesgo, pide una foto o aprobación puntual.
7. Persiste estado, reintenta fallos, registra cada acción y da seguimiento hasta reparación, reemplazo o descarte seguro.

### Momento de demo

Una foto de un electrodoméstico o alimento entra al sistema. Se publica un retiro oficial simulado basado en datos reales; el agente identifica una coincidencia exacta, muestra su evidencia, ejecuta el flujo de remedio y actualiza el estado mientras Pub/Sub, Cloud Run y los logs prueban la ejecución en Google Cloud.

### Por qué puede competir

- Resuelve seguridad real y global, no productividad abstracta.
- Actúa en segundo plano durante semanas y termina un proceso.
- Gemini multimodal es esencial, no decorativo.
- Los datos oficiales son accesibles y auditables.
- La demo tiene un antes/después visual claro.
- Permite demostrar estado, eventos, idempotencia, confianza, aprobación humana y recuperación ante fallos.

### Riesgos a validar

- Cobertura desigual de fuentes oficiales fuera de Estados Unidos.
- Integraciones de fabricantes sin APIs uniformes; la demo necesitará adaptadores controlados y correo.
- Evitar afirmar que una coincidencia incierta es definitiva.
- Privacidad del inventario del hogar y datos de compra.
- No automatizar acciones irreversibles sin consentimiento explícito.

## Segunda opción: CareRelay

Tiene mayor carga emocional e impacto humano, pero implica información médica sensible, integraciones fragmentadas y riesgos de seguridad clínica. Solo debería superar a RecallGuard si el participante tiene experiencia personal con cuidados y puede construir una historia auténtica sin exponer datos privados.
