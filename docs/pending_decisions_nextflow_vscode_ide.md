# Pending Decisions for the Nextflow VS Code IDE

## Executive Summary

The product's basic architecture is already reasonably well defined: a VS Code extension with a lightweight TypeScript/Node client, integration with the Nextflow language server, and rich panels built with webviews. However, several critical decisions are still needed to turn the idea into an executable product with controlled risk. What remains to be settled is primarily product, scope, experience, compatibility, security, and validation strategy rather than technology.[cite:166][cite:161][cite:162]

The repository scaffold now exists, so these are no longer blockers for starting all coding. They are blockers for finishing the MVP cleanly without rework and must be kept synchronized with implementation progress.

The current situation is favorable because official Nextflow support already exists in VS Code and partial solutions such as Nextflow Sandbox are also available, allowing development to move faster and avoiding a start from zero. Precisely for that reason, the product's differentiating gap and the boundaries between what is reused, complemented, and built from scratch must be defined more precisely.[cite:166][cite:173][cite:176]

## 1. Product Definition

The first pending area is the formal product definition. Before adding more technical detail, the team must agree on who the IDE is for, which problem it solves first, and why that problem is not already sufficiently covered by the CLI, the official extension, or existing community tools. Product and architecture planning guidance emphasizes that objectives, deliverables, and success criteria should be explicit before intensive execution begins.[cite:200][cite:205][cite:206]
### Pending Decisions

- Primary persona: individual developer, bioinformatician, nf-core maintainer, platform engineer, academic team, or platform team.
- Initial segment: advanced local users, small teams, training, enterprise adoption, or the open source community.
- Primary problem: simpler local execution, debugging, artifact visualization, reducing friction between editing and running, or preparing for remote execution.
- Main value proposition: “local IDE for developing and running Nextflow” versus “visual execution platform”.
- Positioning: complement to Seqera Platform and the official extension, or a more complete integrated experience inside VS Code.

### Recommended Deliverables

- A one- to three-page PRD.
- Definition of primary and secondary personas.
- Prioritized list of jobs to be done.
- Map of current problems in the CLI workflow.
- Value matrix against existing solutions.[cite:166][cite:173][cite:176]
## 2. MVP Functional Scope

The second pending area is to close the MVP definition precisely. Without this definition, the main risk is building an overly broad solution that replicates many existing ecosystem capabilities without delivering a truly polished experience. A strong MVP should focus on a clear and measurable value sequence.[cite:205][cite:206]

### Pending Decisions

- Exact flow for v1: open a project, configure parameters, run, follow logs, open artifacts, and resume.
- Explicitly excluded functions: multi-user collaboration, advanced remote observability, visual DAG editing, cloud synchronization, and distributed compute management.
- Operations supported in the first version: `run`, `resume`, `log`, artifact opening, presets, and history.
- Configuration formats: `nextflow.config`, manual parameters, `.json` files, `.yaml` files, and `params-file`.
- Artifact types indexed from day one: `report`, `trace`, `timeline`, DAG, outputs, and `work/`.

### Recommended Deliverables

- MoSCoW requirements list.
- Version 1 in/out matrix.
- Five to eight user stories with acceptance criteria.
- Closed MVP scope document.
## 3. Relationship with the Official Nextflow Extension

One of the most strategic remaining decisions is how the product will coexist with the official Nextflow VS Code extension. The official extension already provides highlighting, navigation, completion, diagnostics, formatting, a project view, and DAG preview, so the new product should avoid duplicating value unnecessarily.[cite:166][cite:202]

### Pending Decisions

- Whether the IDE will be installed as a complementary extension or as an integrated experience that assumes the official extension.
- Whether official language-server capabilities will be reused or encapsulated through custom adapters.
- Whether the experience will be unified or use separate panels.
- How possible conflicts involving commands, views, icons, or activation will be resolved.
- Which language-support capabilities are considered external and which will be developed inside the new product.

### Recommended Deliverables

- Integration strategy document.
- Functional dependency map with the official extension.
- Compatibility risk list and mitigation plan.[cite:166]
## 4. Detailed Functional Specification

Beyond the high-level MVP, a concrete functional specification is still needed. Product and architecture definition guidance generally recommends making functional requirements and acceptance criteria explicit before sustained development, especially for tools with multiple workflows and states.[cite:200][cite:205]

### Areas Requiring Detail

- Automatic Nextflow workspace detection.
- Discovery of `main.nf`, configurations, modules, and profiles.
- Parameters: editing, validation, presets, defaults, and reuse.
- Execution: launch, stop, retry, resume, and logs.
- Results: indexing, opening, filtering, and classification.
- History: recent runs, comparison, and configuration duplication.
- Diagnostics: execution errors, configuration errors, and contextual help.
- Opening terminals, folders, and HTML reports.

### Recommended Deliverables

- Functional specification by module.
- Main flows in step-by-step format.
- Acceptance criteria for each screen or feature.
## 5. Non-Functional Requirements

Non-functional requirements are not yet defined precisely enough. Without them, it is difficult to make sound decisions about performance, compatibility, security, persistence, and remote support. Architecture and roadmap documentation generally identifies this layer as essential to avoid costly redesigns later.[cite:200][cite:205]

### Pending Decisions

- Acceptable performance in large workspaces.
- Maximum time to detect a project.
- Target time to start an execution from the UI.
- Minimum operating-system support: macOS, Linux, and Windows.
- Minimum VS Code version support.
- Local support versus remote environments (SSH, containers, and Codespaces).
- Resilience when the language server fails or the Nextflow binary is missing.
- Persistence policy and maximum history size.

### Recommended Deliverables

- Prioritized NFR list.
- Technical compatibility table.
- Performance and memory budget.
## 6. UX and Interaction Design

The architecture already proposes webviews, panels, and side views, but these still need to be translated into a concrete user experience. VS Code recommends using webviews only when they provide clear value and paying particular attention to their integration with the editor's visual language and interaction patterns.[cite:162][cite:165]

### Pending Decisions

- Main visual structure: sidebar, bottom panel, right-side views, tabs, or dedicated panels.
- Exact “Run pipeline” flow.
- Exact “Run failed” flow.
- Information shown in the initial state before any runs exist.
- Representation of presets and history.
- How HTML artifacts and system folders are opened.
- Which parts use native VS Code UI and which require a webview.

### Recommended Deliverables

- Complete user flows.
- Low-fidelity wireframes.
- Navigable prototype of key screens.
- Catalog of empty, loading, error, and success states.
## 7. Runtime and Execution Model

Another major pending definition is the exact runtime model. The plugin will rely on the Nextflow CLI, but it has not yet been decided how far it will automate environments, profiles, containers, and execution configuration. Nextflow is a highly flexible orchestration layer, and that flexibility can become complex if the first version is not bounded carefully.[cite:163]

### Pending Decisions

- How the `nextflow` binary is resolved.
- How the absence of Nextflow is detected.
- How the final command is built from the UI.
- Which profiles are discovered automatically.
- What support exists for Docker, Conda, Singularity/Apptainer, and pure local execution.
- How each run is identified and indexed.
- How artifacts are linked to a specific run.
- Plugin behavior in remote workspaces.

### Recommended Deliverables

- Local runtime specification.
- Execution sequence diagram.
- Decision table for each supported environment.
## 8. Data Model and Persistence

The conceptual data model has been sketched, but it still needs to become a complete development specification. This matters because features such as history, presets, run comparison, and state recovery depend heavily on a coherent model from the beginning.

### Pending Decisions

- Final entities: `WorkspaceProject`, `Run`, `RunConfiguration`, `Profile`, `Artifact`, `ExecutionEvent`, and related entities.
- Which data is persisted at user level and which at workspace level.
- How persisted configurations are versioned.
- How old history is cleaned up.
- Which data is sensitive and must not be stored.

### Recommended Deliverables

- Logical entity schema.
- Shared TypeScript contracts.
- Persistence and migration policy.
## 9. Security

Security is not yet sufficiently specified, and it is critical because the plugin will execute local commands. VS Code documents both its runtime security model for extensions and specific recommendations for telemetry and responsible Marketplace behavior.[cite:198][cite:203]

### Pending Decisions

- Exact operations the plugin may launch.
- How the final command is shown to the user before execution.
- How parameters are validated and escaped.
- Restrictions on opening paths and files.
- Which UI parts are considered trusted or untrusted.
- Whether a safe or read-only mode will exist.

### Recommended Deliverables

- Lightweight threat model.
- Command-execution policy.
- Webview and host security checklist.
## 10. Telemetry, Analytics, and Privacy

Telemetry policy is another pending decision. Microsoft provides explicit guidance for extension authors on enabling telemetry while respecting user preferences. If the product wants to learn from real usage, this decision should not be improvised at the end.[cite:198]

### Pending Decisions

- Whether telemetry will be collected.
- Events collected: run started, run failed, artifact opened, panel usage, and feature adoption.
- How information is anonymized.
- How the policy is communicated to users.
- Which product metrics are essential.

### Recommended Deliverables

- Privacy policy.
- Event schema.
- Metrics list enabled during beta.
## 11. Publication and Distribution Strategy

The product's publication and distribution model also needs to be defined. VS Code has requirements and protections around runtime, security, and the Marketplace, so it is advisable to decide early whether the plugin will be private, closed beta, pre-release, or public.[cite:203]

### Pending Decisions

- Initial channel: private, closed beta, pre-release, or public Marketplace.
- Versioning policy.
- Minimum VS Code compatibility.
- Update and changelog strategy.
- Installation and support documentation.

### Recommended Deliverables

- Release plan.
- Semantic versioning policy.
- Publication checklist.
## 12. Competitive Benchmark and Differentiation

Although reference products have already been identified, a more systematic benchmark is still needed. The existence of the official Nextflow extension and tools such as Nextflow Sandbox makes it necessary to define more precisely the exclusive value the product will deliver.[cite:166][cite:173][cite:176]

### Pending Decisions

- Which tasks are currently slower or more cumbersome with the CLI alone.
- What the official extension covers well and what it does not.
- What Nextflow Sandbox covers and how well.
- Which differentiated experience to build: better UX, better integration, better observability, fewer steps, or stronger local focus.

### Recommended Deliverables

- Competitive comparison table.
- Product gap matrix.
- Differentiation narrative document.
## 13. Validation and Beta Strategy

Before entering a long development cycle, an explicit validation plan is also needed. Modern roadmap and product-development guidance recommends validating hypotheses, users, and workflows before committing too much investment to implementation.[cite:204][cite:205][cite:206]

### Pending Decisions

- Number of beta users to invite.
- Beta tester profiles.
- Tasks they must test.
- Metrics to collect.
- Signals that determine whether to continue, pivot, or reduce scope.

### Recommended Deliverables

- Interview plan.
- Closed-beta plan.
- Usability-test script.
- Validation metrics dashboard.
## 14. Project Organization and Team

Although a general structure has already been proposed, the practical execution model still needs to be defined. Roles, cadence, technical ownership, and decision-making mechanisms should be settled. Product roadmaps often fail not because of a lack of ideas, but because of unclear governance.[cite:205][cite:206]

### Pending Decisions

- Product owner.
- Person responsible for deciding MVP scope.
- Owner of the execution layer.
- UX owner.
- Bug-versus-feature prioritization process.
- Planning and release cadence.

### Recommended Deliverables

- Simplified RACI.
- Planning and review cadence.
- Prioritized initial backlog.
## Recommended Order for Resolving Pending Items

The pending work should be addressed in this order because it reduces uncertainty before implementation begins:

1. PRD and target-user definition.
2. MVP functional scope.
3. Coexistence strategy with the official extension.
4. Main UX flows and wireframes.
5. Local/remote runtime specification.
6. Non-functional requirements and compatibility.
7. Security and telemetry.
8. Data model and persistence.
9. Beta plan and metrics.
10. Publication strategy.

This order helps avoid one of the most common risks in developer tools: building substantial infrastructure before value, scope, and success criteria have been settled.[cite:205][cite:206]

## Final Recommendation

The most valuable next action is not to produce more isolated technical detail, but to turn these pending areas into a closed set of product definitions. The best next deliverable would be a short but complete package containing a PRD, an MVP specification, an integration document for the official extension, key wireframes, and a runtime model definition. With that package, the project would move from a “well-directed idea” to a product ready for sprint planning.[cite:166][cite:205][cite:206]
# Definiciones pendientes para el IDE de Nextflow basado en VS Code

## Resumen ejecutivo

La arquitectura base del producto ya está razonablemente definida: una extensión de VS Code con un cliente ligero en TypeScript/Node, integración con el language server de Nextflow y paneles ricos mediante webviews. Sin embargo, todavía faltan varias definiciones críticas para convertir la idea en un producto ejecutable con riesgo controlado. Lo que queda por cerrar no es principalmente tecnológico, sino de producto, alcance, experiencia, compatibilidad, seguridad y estrategia de validación.[cite:166][cite:161][cite:162]

La situación actual es favorable porque ya existe soporte oficial de Nextflow en VS Code y también existen soluciones parciales como Nextflow Sandbox, lo que permite acelerar el desarrollo y evitar partir de cero. Precisamente por eso es indispensable definir con más precisión el hueco diferencial del producto y las fronteras entre lo que se reutiliza, lo que se complementa y lo que se construye desde cero.[cite:166][cite:173][cite:176]

## 1. Definición de producto

El primer bloque pendiente es la definición formal del producto. Antes de seguir diseñando más detalle técnico, hace falta consensuar con claridad para quién se construye el IDE, qué problema resuelve primero y por qué ese problema no queda ya suficientemente cubierto por la CLI, la extensión oficial o herramientas comunitarias existentes. Las guías de planificación de producto y arquitectura insisten en que los objetivos, entregables y criterios de éxito deben explicitarse antes de entrar en ejecución intensiva.[cite:200][cite:205][cite:206]

### Decisiones pendientes

- Persona principal: desarrollador individual, bioinformático, mantenedor nf-core, platform engineer, equipo académico o equipo de plataforma.
- Segmento inicial: usuarios locales avanzados, equipos pequeños, formación, adopción empresarial o comunidad open source.
- Problema principal: ejecución local más simple, depuración, visualización de artefactos, reducción de fricción entre edición y run, o preparación de ejecución remota.
- Propuesta de valor principal: “IDE local para desarrollar y correr Nextflow” frente a “plataforma visual de ejecución”.
- Posicionamiento: complemento de Seqera Platform y de la extensión oficial, o experiencia integrada más completa dentro de VS Code.

### Entregables recomendados

- PRD de 1 a 3 páginas.
- Definición de personas principales y secundarias.
- Lista priorizada de jobs-to-be-done.
- Mapa de problemas actuales del flujo CLI.
- Matriz de valor frente a soluciones existentes.[cite:166][cite:173][cite:176]

## 2. Alcance funcional del MVP

El segundo bloque pendiente es cerrar con precisión el MVP. Sin esta definición, el riesgo principal es construir una solución demasiado amplia y terminar replicando muchas capacidades del ecosistema existente sin llegar a una experiencia verdaderamente pulida. Un MVP fuerte debe concentrarse en una secuencia de valor clara y medible.[cite:205][cite:206]

### Decisiones pendientes

- Qué flujo exacto resuelve la v1: abrir proyecto, parametrizar, ejecutar, seguir logs, abrir artefactos, hacer resume.
- Qué funciones quedan explícitamente fuera: colaboración multiusuario, observabilidad remota avanzada, edición visual del DAG, sincronización cloud, gestión de cómputo distribuido.
- Qué operaciones soporta la primera versión: `run`, `resume`, `log`, apertura de artefactos, presets, historial.
- Qué formatos de configuración manejará: `nextflow.config`, parámetros manuales, archivos `.json`, `.yaml`, `params-file`.
- Qué tipos de artefactos indexará desde el primer día: `report`, `trace`, `timeline`, DAG, outputs y `work/`.

### Entregables recomendados

- Lista MoSCoW de requisitos.
- Matriz de in/out para la versión 1.
- 5 a 8 user stories con criterio de aceptación.
- Documento de alcance cerrado del MVP.

## 3. Relación con la extensión oficial de Nextflow

Una de las decisiones más estratégicas que faltan es definir cómo convivirá el producto con la extensión oficial de Nextflow para VS Code. La extensión oficial ya proporciona resaltado, navegación, completado, diagnósticos, formato, vista de proyecto y previsualización del DAG, por lo que el producto nuevo debe evitar duplicar valor sin necesidad.[cite:166][cite:202]

### Decisiones pendientes

- Si el IDE se instalará como extensión complementaria o como experiencia integrada que presupone la extensión oficial.
- Si se reutilizarán capacidades del language server oficial o se encapsularán mediante adaptadores propios.
- Si se mostrará una experiencia unificada o coexistirán paneles separados.
- Cómo se resolverán posibles conflictos de comandos, vistas, iconografía o activación.
- Qué parte del soporte de lenguaje se considera “externa” y qué parte se desarrollará dentro del nuevo producto.

### Entregables recomendados

- Documento de estrategia de integración.
- Mapa de dependencias funcionales con la extensión oficial.
- Lista de riesgos de compatibilidad y plan de mitigación.[cite:166]

## 4. Especificación funcional detallada

Además del MVP a alto nivel, sigue faltando una especificación funcional concreta. Las guías de definición de producto y arquitectura suelen recomendar explicitar requisitos funcionales y criterios de aceptación antes de pasar a desarrollo sostenido, especialmente en herramientas con múltiples flujos y estados.[cite:200][cite:205][cite:206]

### Áreas que falta detallar

- Detección automática del workspace Nextflow.
- Descubrimiento de `main.nf`, configuraciones, módulos y perfiles.
- Parámetros: edición, validación, presets, defaults, reuso.
- Ejecución: lanzar, parar, reintentar, resume, logs.
- Resultados: indexado, apertura, filtrado, clasificación.
- Historial: runs recientes, comparación y duplicado de configuración.
- Diagnóstico: errores de ejecución, errores de configuración y ayudas contextuales.
- Apertura de terminal, carpetas y reportes HTML.

### Entregables recomendados

- Especificación funcional por módulos.
- Flujos principales en formato paso a paso.
- Criterios de aceptación por pantalla o feature.

## 5. Requisitos no funcionales

Todavía no están definidos con suficiente precisión los requisitos no funcionales. Sin ellos, es difícil tomar decisiones correctas sobre rendimiento, compatibilidad, seguridad, persistencia y soporte remoto. La documentación de arquitectura y roadmap suele remarcar esta capa como indispensable para evitar rediseños costosos más adelante.[cite:200][cite:205]

### Decisiones pendientes

- Rendimiento aceptable en workspaces grandes.
- Tiempo máximo para detectar un proyecto.
- Tiempo objetivo para arrancar una ejecución desde la UI.
- Soporte mínimo por sistema operativo: macOS, Linux, Windows.
- Soporte mínimo por versión de VS Code.
- Soporte local frente a entornos remotos (SSH, containers, Codespaces).
- Robustez ante fallos del language server o ausencia del binario Nextflow.
- Política de persistencia y tamaño máximo de historial.

### Entregables recomendados

- Lista de NFRs priorizados.
- Tabla de compatibilidad técnica.
- Presupuesto de rendimiento y memoria.

## 6. UX y diseño de interacción

La arquitectura ya propone webviews, paneles y vistas laterales, pero todavía falta bajar eso a una experiencia de usuario concreta. VS Code recomienda usar webviews solo cuando aportan un valor claro y cuidar especialmente su integración con el lenguaje visual y los patrones del editor.[cite:162][cite:165]

### Decisiones pendientes

- Estructura visual principal: sidebar, panel inferior, vistas derechas, tabs o paneles dedicados.
- Flujo exacto de “Run pipeline”.
- Flujo exacto de “Run failed”.
- Qué información aparece en el estado inicial sin runs previos.
- Cómo se representan los presets y el historial.
- Cómo se abren artefactos HTML o carpetas del sistema.
- Qué parte de la experiencia usa UI nativa de VS Code y cuál requiere webview.

### Entregables recomendados

- User flows completos.
- Wireframes low fidelity.
- Prototipo navegable de pantallas clave.
- Catálogo de estados vacíos, loading, error y success.

## 7. Modelo de runtime y ejecución

Otra de las grandes definiciones pendientes es el modelo exacto de runtime. El plugin va a apoyarse en la CLI de Nextflow, pero todavía no está decidido hasta dónde automatizará entornos, perfiles, contenedores y configuración de ejecución. Nextflow es una capa de orquestación muy flexible y esa flexibilidad puede volverse compleja si no se acota bien la primera versión.[cite:163]

### Decisiones pendientes

- Cómo se resuelve el binario `nextflow`.
- Cómo se detecta si Nextflow no está instalado.
- Cómo se construye el comando final desde la UI.
- Qué perfiles se descubren automáticamente.
- Qué soporte habrá para Docker, Conda, Singularity/Apptainer y ejecución local pura.
- Cómo se identifica e indexa cada run.
- Cómo se vinculan artefactos a un run concreto.
- Qué comportamiento tendrá el plugin en workspaces remotos.

### Entregables recomendados

- Especificación del runtime local.
- Diagrama de secuencia de ejecución.
- Tabla de decisiones por entorno soportado.

## 8. Modelo de datos y persistencia

El modelo de datos conceptual ya está esbozado, pero todavía falta convertirlo en una especificación completa para desarrollo. Esto es importante porque features como historial, presets, comparación de runs y recuperación de estado dependen mucho de un modelo coherente desde el inicio.

### Decisiones pendientes

- Entidades definitivas: `WorkspaceProject`, `Run`, `RunConfiguration`, `Profile`, `Artifact`, `ExecutionEvent` y similares.
- Qué datos se persisten a nivel usuario y cuáles a nivel workspace.
- Cómo se versionan las configuraciones persistidas.
- Cómo se limpian historiales viejos.
- Qué datos se consideran sensibles y no deben guardarse.

### Entregables recomendados

- Esquema lógico de entidades.
- Contratos TypeScript compartidos.
- Política de persistencia y migración.

## 9. Seguridad

La seguridad todavía no está suficientemente concretada y es una dimensión crítica porque el plugin ejecutará comandos locales. VS Code documenta tanto su modelo de seguridad de runtime para extensiones como recomendaciones específicas para telemetría y comportamiento responsable en el Marketplace.[cite:198][cite:203]

### Decisiones pendientes

- Qué operaciones exactas podrá lanzar el plugin.
- Cómo se mostrará al usuario el comando final antes de ejecutar.
- Cómo se validarán y escaparán parámetros.
- Qué restricciones existirán para apertura de rutas y archivos.
- Qué partes de la UI se considerarán confiables o no confiables.
- Si existirá un modo seguro o de solo lectura.

### Entregables recomendados

- Threat model ligero.
- Política de ejecución de comandos.
- Checklist de seguridad de webviews y host.

## 10. Telemetría, analítica y privacidad

Otra definición pendiente es la política de telemetría. Microsoft tiene guías explícitas para autores de extensiones sobre cómo habilitar telemetría respetando las preferencias del usuario. Si el producto quiere aprender de su uso real, esta decisión no debe improvisarse al final.[cite:198]

### Decisiones pendientes

- Si habrá telemetría o no.
- Qué eventos se recogen: run started, run failed, artifact opened, panel usage, feature adoption.
- Cómo se anonimiza la información.
- Cómo se comunica al usuario.
- Qué métricas de producto son imprescindibles.

### Entregables recomendados

- Política de privacidad.
- Esquema de eventos.
- Lista de métricas activables en beta.

## 11. Estrategia de publicación y distribución

Falta definir también cómo se publicará y distribuirá el producto. VS Code tiene requisitos y protecciones específicas alrededor del runtime, la seguridad y el Marketplace, lo que hace aconsejable decidir pronto si el plugin será privado, beta cerrada, pre-release o lanzamiento abierto.[cite:203]

### Decisiones pendientes

- Canal inicial: privada, beta cerrada, pre-release, Marketplace público.
- Política de versionado.
- Compatibilidad mínima de VS Code.
- Estrategia de actualizaciones y changelog.
- Documentación de instalación y soporte.

### Entregables recomendados

- Plan de release.
- Política de versionado semántico.
- Checklist de publicación.

## 12. Benchmark competitivo y diferencial

Aunque ya se han identificado referentes, todavía falta un benchmark más sistemático. La existencia de la extensión oficial de Nextflow y de herramientas como Nextflow Sandbox obliga a concretar mejor qué valor exclusivo entregará el producto.[cite:166][cite:173][cite:176]

### Decisiones pendientes

- Qué tareas son hoy más lentas o incómodas con CLI pura.
- Qué cubre bien la extensión oficial y qué no.
- Qué cubre Nextflow Sandbox y con qué calidad.
- Qué experiencia diferencial se quiere construir: mejor UX, mejor integración, mejor observabilidad, menos pasos, más foco local.

### Entregables recomendados

- Tabla comparativa competitiva.
- Matriz de huecos de producto.
- Documento de narrativa diferencial.

## 13. Plan de validación y beta

Antes de entrar en desarrollo largo, también falta definir un plan explícito de validación. Las guías modernas de roadmap y desarrollo de producto recomiendan validar hipótesis, usuarios y flujos antes de comprometer demasiada inversión en construcción.[cite:204][cite:205][cite:206]

### Decisiones pendientes

- Cuántos usuarios beta se invitarán.
- Perfil de los beta testers.
- Qué tareas deben probar.
- Qué métricas se recogerán.
- Qué señales determinarán continuar, pivotar o recortar alcance.

### Entregables recomendados

- Plan de entrevistas.
- Plan de beta cerrada.
- Guion de test de usabilidad.
- Dashboard de métricas de validación.

## 14. Organización del proyecto y equipo

Aunque ya se propuso una estructura general, aún falta definir cómo se va a ejecutar el proyecto en la práctica. Es importante cerrar roles, cadencia, ownership técnico y mecanismo de decisión. Los roadmaps de producto suelen fallar no por falta de ideas, sino por falta de gobernanza clara.[cite:205][cite:206]

### Decisiones pendientes

- Quién es el product owner.
- Quién decide el alcance del MVP.
- Quién mantiene la capa de ejecución.
- Quién diseña la UX.
- Cómo se priorizan bugs frente a features.
- Qué cadencia de demos y releases se seguirá.

### Entregables recomendados

- RACI simplificado.
- Cadencia de planificación y review.
- Backlog inicial priorizado.

## Orden recomendado para definir lo pendiente

El trabajo pendiente debería abordarse en este orden, porque reduce incertidumbre antes de entrar en implementación:

1. PRD y definición del usuario objetivo.
2. Alcance funcional del MVP.
3. Estrategia de convivencia con la extensión oficial.
4. Flujos UX principales y wireframes.
5. Especificación del runtime local/remoto.
6. Requisitos no funcionales y compatibilidad.
7. Seguridad y telemetría.
8. Modelo de datos y persistencia.
9. Plan de beta y métricas.
10. Estrategia de publicación.

Este orden ayuda a evitar uno de los riesgos más comunes en herramientas de desarrollador: construir mucha infraestructura sin haber cerrado antes el valor real, el alcance y los criterios de éxito.[cite:205][cite:206]

## Recomendación final

La siguiente acción más valiosa no es producir más detalle técnico aislado, sino convertir estas áreas pendientes en un paquete cerrado de definiciones de producto. El mejor siguiente entregable sería un set corto pero completo compuesto por un PRD, una especificación de MVP, un documento de integración con la extensión oficial, wireframes clave y una definición del modelo de runtime. Con eso, el proyecto pasaría de “idea bien encaminada” a “producto listo para planificarse en sprints”.[cite:166][cite:205][cite:206]
