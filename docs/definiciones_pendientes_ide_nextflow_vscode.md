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
