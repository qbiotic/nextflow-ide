# Technical Architecture for the Nextflow VS Code Plugin

## Summary

The technical architecture of a Nextflow plugin for Visual Studio Code should be organized as a system with three main layers: the VS Code extension client, a language server for semantic analysis, and an execution/observability layer for launching and tracking pipelines. The official Nextflow VS Code extension already uses a lightweight client and delegates language analysis to a Java language server, providing a strong foundation for expanding the product into a more complete IDE.[cite:166][cite:161][cite:194]

The most important architectural decision is not to mix semantic analysis, runtime execution, and user experience into one block. The correct approach is to clearly separate language semantics, local execution orchestration, and the visual layer built with VS Code webviews and panels. This separation improves maintainability, facilitates testing, and avoids duplicating existing logic.[cite:162][cite:187][cite:194]

## Architectural Objective

The objective of this architecture is to turn VS Code into a specialized environment for Nextflow that addresses three needs at the same time: writing and navigating code with semantic intelligence, running local pipelines in a guided way, and viewing results, artifacts, and errors in a coherent interface. The VS Code platform already provides an editor, file tree, integrated terminal, command system, panels, and extension support, so the plugin does not need to reinvent those pieces.[cite:167][cite:187]

The intended result is a developer-focused vertical IDE for pipelines, not a distributed orchestration platform. The execution layer should treat the Nextflow CLI as a local backend, while the analysis layer relies on the language server and the UI is implemented with standard VS Code ecosystem mechanisms.[cite:161][cite:166]

## Hexagonal Architecture

The implementation must follow hexagonal architecture (Ports and Adapters). The domain and application layers are the center of the system; VS Code, Node.js, the Nextflow CLI, Docker, the file system, persistence, and webviews are external concerns.

The dependency rule is strict:

- `domain` depends on no framework, process API, file system, or VS Code API.
- `application` depends only on domain types and inbound/outbound port interfaces.
- `adapters` implement ports and translate external data into domain commands and events.
- `extension` is the composition root: it creates adapters, wires use cases, and registers VS Code commands and views.
- Webviews communicate through typed messages and never invoke processes, access files, or mutate persistence directly.

```text
VS Code commands/views       Webview message adapter
          |                         |
          v                         v
       Inbound ports -> Application use cases <- Outbound ports
                              |
                              v
                          Domain core
                              ^
       Adapters: local runtime, Docker, file system, state, LSP
```

The domain must be executable in isolation. Tests for command construction, run state transitions, artifact discovery rules, and validation must not require VS Code, Docker, Nextflow, or a real workspace.

### Hexagonal Module Layout

```text
src/
  domain/
    model/
    services/
    errors/
  application/
    ports/
      inbound/
      outbound/
    use-cases/
    dto/
  adapters/
    inbound/
      vscode-commands/
      webview-messages/
    outbound/
      nextflow-local/
      docker/
      vscode-state/
      workspace-files/
      nextflow-lsp/
  extension/
    composition-root/
```

### Design Patterns

Use patterns deliberately and keep them subordinate to the domain model:

| Pattern | Application in this project |
|---|---|
| Ports and Adapters | Isolate the core from VS Code, CLI, Docker, persistence, and webviews. |
| Use Case / Application Service | Orchestrate `RunPipeline`, `ResumeRun`, `StopRun`, and `GetRunHistory`. |
| Strategy | Select local or Docker runtime without branching inside use cases. |
| Factory | Create validated `RunConfiguration` and runtime commands. |
| State Machine | Enforce valid `Run` transitions such as queued -> running -> failed/resumable. |
| Repository | Abstract run history and configuration persistence. |
| Anti-Corruption Layer | Translate LSP, VS Code, Docker, and process events into stable domain objects. |
| Observer / Event Publisher | Stream execution logs and run lifecycle events to projections and views. |
| Dependency Injection | Compose concrete adapters only at the extension composition root. |

Do not introduce a service locator, static global state, framework-dependent domain entities, or a generic repository abstraction without a concrete use case. Adapters may depend on external APIs; the core must not depend on adapters.

## Main Layers

The architecture is organized into four main functional layers.

| Layer | Function | Main technology |
|---|---|---|
| VS Code Workbench | Editor, panels, explorer, terminal, commands | VS Code [cite:167] |
| Extension Host | Plugin orchestration, state, processes, integration with VS Code APIs | TypeScript/Node [cite:187] |
| Language Server | Parsing, diagnostics, navigation, completion, symbols, semantic model | Java + LSP [cite:161][cite:194] |
| Webviews | Forms, execution dashboards, history, artifacts, comparison views | HTML/CSS/JS or React [cite:162][cite:165] |

VS Code runs extensions inside the Extension Host, a process isolated from the main workbench to protect editor stability and performance. This model is especially important because a complete Nextflow plugin may combine intensive tasks such as parsing, indexing, process tracking, and rendering rich interfaces.[cite:187][cite:193]

## VS Code Workbench

The workbench is the user's visible surface: editor, terminal, explorer, side panels, activity bar, and bottom panel. From the plugin's perspective, the workbench is the container where the Nextflow experience is projected, but it must not contain business logic. All specific capabilities are exposed through commands, trees, panels, diagnostics, and webviews registered by the extension.[cite:167]

This layer should make the most of native VS Code patterns to reduce friction: tree views for projects and runs, a bottom panel for logs, opening HTML in a preview or external browser, and commands accessible from the palette. The more closely the interaction resembles a standard VS Code workflow, the lower the learning curve.[cite:165][cite:167]

## Extension Host

The Extension Host is the plugin's operational core. It contains the logic that detects Nextflow projects, starts the language server, registers commands, maintains workspace state, coordinates local `nextflow` execution, and communicates that state to webviews. Microsoft documents this layer as the environment where extensions run and where integrations with the editor API should be concentrated.[cite:187]

The Extension Host must act as orchestrator and trust boundary. The UI must not launch system processes directly; instead, it sends messages to the host, which validates them, resolves paths, composes commands, and exposes only the necessary information back to panels. This decision is essential for both security and maintainability.[cite:162][cite:189]

## Language Server

The official Nextflow VS Code extension is based on a Java language server that implements the Language Server Protocol. The extension client is relatively lightweight and only starts the server, establishes the connection, and translates LSP capabilities into interactions inside VS Code, such as hover, completion, navigation, and diagnostics.[cite:161][cite:194]

In a complete IDE, this component should remain the center of static analysis. It should be the source of truth for symbols, modules, references, pipeline structure, diagnostics, and useful metadata for other views. The TypeScript layer should not duplicate parsers or semantic logic; its role is to consume LSP results and transform them into richer user experiences.[cite:166][cite:194]

## Nextflow Execution Layer

The execution layer is the major differentiator from the official extension. Its mission is to turn the Nextflow CLI into a locally governed backend. It must resolve the `nextflow` binary, build commands from visual configurations, launch processes, stream live logs, support cancellation, and expose run state to other parts of the system.

Architecturally, this layer must be decoupled from the language server. The language describes and validates the pipeline; the runtime executes it. Separating these concerns allows the operational experience to evolve without touching semantics and avoids introducing circular dependencies between analysis and execution.

### Execution Layer Responsibilities

- Resolve the Nextflow binary and validate its availability.
- Build the final command from parameters, profiles, and options.
- Launch `nextflow run`, `nextflow log`, or other permitted commands.
- Capture stdout, stderr, and exit code.
- Support actions such as Stop, Resume, and Re-run.
- Detect artifacts generated by each execution.
- Persist run and configuration history.

## Webviews and Rich Panels

VS Code allows fully customized views through webviews. This mechanism is most appropriate when the required UX exceeds what native tree, Quick Pick, or basic form components provide. Microsoft documents webviews as powerful containers for custom experiences, while also emphasizing that they should be treated as isolated environments communicating through messages.[cite:162][cite:165]

In this plugin, webviews should be used for parameter panels, execution dashboards, run history, configuration comparison, and artifact explorers. The recommended architecture is to keep the webview as a pure presentation client and use the Extension Host as the state and actions backend, communicating through an explicit message protocol.[cite:189]

## Data and Control Flow

The general technical flow should follow this sequence:

1. The user opens a workspace.
2. The extension detects whether a Nextflow project is present.
3. The Extension Host starts the LSP client.
4. The language server analyzes scripts and configurations.
5. The host builds an enriched project model.
6. Native views and webviews render that model.
7. The user defines parameters and starts an execution.
8. The webview sends an action to the host.
9. The host composes and launches the `nextflow` command.
10. The host streams logs, state, and artifacts to the interface.
11. The user inspects results and errors or relaunches with `-resume`.

This design makes the boundaries explicit: analysis in the language server, orchestration in the host, and rendering in the UI. That clarity is one of the main architectural quality criteria for the plugin.

## Recommended Modules

The extension should be organized into decoupled modules with explicit contracts. A reasonable structure would be:

```text
src/
  extension/
    activate.ts
    commands/
    views/
    workspace/
    state/
  language/
    client/
    adapters/
    projectModel/
  execution/
    resolver/
    runBuilder/
    processRunner/
    artifactIndexer/
    runHistory/
  ui/
    webviews/
      params/
      runs/
      artifacts/
      compare/
    messaging/
  shared/
    types/
    events/
    contracts/
```

This structure separates responsibilities and facilitates unit testing and gradual integration. It also prepares the project to evolve from an MVP into a more complete IDE without turning the extension's main file into a difficult-to-maintain monolith.

## Project Model

The plugin needs an internal model of the Nextflow workspace. This model does not replace the real file tree; it abstracts it for the domain experience. Its minimum entities should be:

- `WorkspaceProject`
- `PipelineEntryPoint`
- `Module`
- `Profile`
- `RunConfiguration`
- `Run`
- `Artifact`
- `ParameterDefinition`
- `ExecutionEvent`

The `RunConfiguration` entity must be separate from `Run`. A configuration describes a reusable intention; a run is a concrete execution with time, state, output, errors, and associated artifacts. This separation will be essential for presets, comparisons, and relaunches.

## Integration with the Official Extension

The best technical strategy is to coexist with the official Nextflow extension and rely on it where practical. The official extension already covers language support, validation, navigation, formatting, and a language-server-backed project view. Rebuilding those capabilities from scratch would greatly increase product complexity without providing proportionate differentiating value.[cite:166][cite:161]

The new IDE layer should focus on execution, local observability, guided parameterization, and operational integration. The product creates value not by replacing language support, but by closing the gap between “edit” and “run/understand” the pipeline in the same environment.[cite:166][cite:177]

## Communication Between Layers

Communication between components must follow strict contracts. The webview must not know about Node, the file system, or child processes. It should send only well-typed messages, such as `RUN_PIPELINE`, `STOP_RUN`, `OPEN_ARTIFACT`, and `GET_RUN_HISTORY`, and receive events such as `RUN_STARTED`, `RUN_LOG_CHUNK`, `RUN_FINISHED`, and `ARTIFACTS_UPDATED`.

Language and execution should also communicate indirectly. The execution layer may consume information derived from the language server without depending on unstable internal structures. Ideally, adapters should translate LSP semantics into a stable project model for the rest of the extension.

## Remote Support

VS Code supports remote scenarios such as SSH, containers, and Codespaces. Official documentation emphasizes that an extension should account for the Extension Host running in an environment different from the graphical client. For a Nextflow plugin this is especially relevant because the pipeline must execute where the workspace resides and where the runtime and data are available.[cite:191][cite:187]

Therefore, the architecture must assume from the beginning that paths, processes, and file access may occur on a remote host. The UI, however, will continue to render locally. This separation should be reflected in both internal APIs and tests.

## Security

An extension that executes local commands has a sensitive attack surface. The first architectural measure is always to show the user the final command that will be launched, with its resolved profiles and parameters. The second is to centralize execution exclusively in the Extension Host. The third is to treat webviews as untrusted clients that communicate only through validated messages.[cite:162][cite:165]

It is also advisable to define a clear policy for permitted operations: which commands may be built, which directories may be opened, which artifacts are indexed, and what information is persisted. Transparency and predictable behavior are essential for adoption in demanding technical environments.

## Internal Plugin Observability

The plugin itself should include optional telemetry and internal logs for diagnosing activation failures, project detection problems, language-server startup issues, or command execution failures. In early phases, a “plugin diagnostics” view can be very useful for validating the product in a closed beta.

Architecturally, this means that each relevant module should emit internal events and metrics, and that a lightweight observability layer should exist independently of the main UI. This information will also help determine which parts of the product deliver the most real value to users.

## Testing and Quality

Testing should follow the same layered structure. Command construction, path resolution, parsing of persisted configurations, and event normalization should be covered by unit tests. View providers, workspace state, and communication between host and webviews should be covered by integration tests. Finally, plugin startup and execution of small real pipelines should be validated with end-to-end tests.

It is also advisable to explicitly test coexistence with the official Nextflow extension. If the product relies on or complements it, verify that there are no conflicts in activation, commands, panels, or diagnostics. This compatibility is both a technical and a product requirement.[cite:166]

## Final Recommendation

The optimal technical architecture for a complete Nextflow plugin in VS Code is a thin client, a dedicated language server, and a local execution backend. The Java language server should remain the primary source of semantic analysis; the TypeScript/Node Extension Host should orchestrate state, commands, and runtime; and webviews should implement the advanced visual experience through a well-defined message protocol.[cite:161][cite:194][cite:162]

This approach aligns with the architecture already adopted by the official Nextflow extension and with Microsoft's documented best practices for complex VS Code extensions. It also allows the product to evolve incrementally into a specialized IDE without sacrificing clarity, security, or maintainability.[cite:166][cite:187][cite:165]
# Arquitectura técnica del plugin de Nextflow para VS Code

## Resumen

La arquitectura técnica de un plugin de Nextflow para Visual Studio Code debe organizarse como un sistema de tres capas principales: cliente de extensión en VS Code, servidor de lenguaje para análisis semántico y capa de ejecución/observabilidad para lanzar y seguir pipelines. La extensión oficial de Nextflow para VS Code ya utiliza un modelo ligero en el cliente y delega el análisis del lenguaje a un language server en Java, lo que proporciona una base muy sólida para ampliar el producto hacia un IDE más completo.[cite:166][cite:161][cite:194]

La decisión arquitectónica más importante es no mezclar análisis semántico, ejecución del runtime y experiencia de usuario en un único bloque. La propuesta correcta es separar claramente la semántica del lenguaje, la orquestación local de ejecuciones y la capa visual construida con webviews y paneles de VS Code. Esa separación mejora la mantenibilidad, facilita las pruebas y evita duplicar lógica ya existente.[cite:162][cite:187][cite:194]

## Objetivo arquitectónico

El objetivo de esta arquitectura es convertir VS Code en un entorno especializado para Nextflow que cubra tres necesidades al mismo tiempo: escribir y navegar código con inteligencia semántica, ejecutar pipelines locales de forma guiada y visualizar resultados, artefactos y errores en una interfaz coherente. La plataforma de VS Code ya aporta editor, árbol de archivos, terminal integrada, sistema de comandos, paneles y soporte de extensiones, por lo que el plugin no necesita reinventar esas piezas.[cite:167][cite:187]

El resultado buscado es un IDE vertical centrado en el desarrollador de pipelines, no una plataforma de orquestación distribuida. La capa de ejecución debe tratar a Nextflow CLI como backend local, mientras la capa de análisis se apoya en el language server y la UI se implementa con los mecanismos estándar del ecosistema VS Code.[cite:161][cite:166]

## Arquitectura hexagonal

The implementation must follow hexagonal architecture (Ports and Adapters). The domain and application layers are the center of the system; VS Code, Node.js, the Nextflow CLI, Docker, the file system, persistence, and webviews are external concerns.

The dependency rule is strict:

- `domain` depends on no framework, process API, file system, or VS Code API.
- `application` depends only on domain types and inbound/outbound port interfaces.
- `adapters` implement ports and translate external data into domain commands and events.
- `extension` is the composition root: it creates adapters, wires use cases, and registers VS Code commands and views.
- Webviews communicate through typed messages and never invoke processes, access files, or mutate persistence directly.

```text
VS Code commands/views       Webview message adapter
          |                         |
          v                         v
       Inbound ports -> Application use cases <- Outbound ports
                              |
                              v
                          Domain core
                              ^
       Adapters: local runtime, Docker, file system, state, LSP
```

The domain must be executable in isolation. Tests for command construction, run state transitions, artifact discovery rules, and validation must not require VS Code, Docker, Nextflow, or a real workspace.

### Hexagonal module layout

```text
src/
  domain/
    model/
    services/
    errors/
  application/
    ports/
      inbound/
      outbound/
    use-cases/
    dto/
  adapters/
    inbound/
      vscode-commands/
      webview-messages/
    outbound/
      nextflow-local/
      docker/
      vscode-state/
      workspace-files/
      nextflow-lsp/
  extension/
    composition-root/
```

### Design patterns

Use patterns deliberately and keep them subordinate to the domain model:

| Pattern | Application in this project |
|---|---|
| Ports and Adapters | Isolate the core from VS Code, CLI, Docker, persistence, and webviews. |
| Use Case / Application Service | Orchestrate `RunPipeline`, `ResumeRun`, `StopRun`, and `GetRunHistory`. |
| Strategy | Select local or Docker runtime without branching inside use cases. |
| Factory | Create validated `RunConfiguration` and runtime commands. |
| State Machine | Enforce valid `Run` transitions such as queued -> running -> failed/resumable. |
| Repository | Abstract run history and configuration persistence. |
| Anti-Corruption Layer | Translate LSP, VS Code, Docker, and process events into stable domain objects. |
| Observer / Event Publisher | Stream execution logs and run lifecycle events to projections and views. |
| Dependency Injection | Compose concrete adapters only at the extension composition root. |

Do not introduce a service locator, static global state, framework-dependent domain entities, or a generic repository abstraction without a concrete use case. Adapters may depend on external APIs; the core must not depend on adapters.

## Capas principales

La arquitectura se organiza en cuatro capas funcionales principales.

| Capa | Función | Tecnología principal |
|---|---|---|
| Workbench de VS Code | Editor, paneles, explorer, terminal, comandos | VS Code [cite:167] |
| Extension Host | Orquestación del plugin, estado, procesos, integración con APIs de VS Code | TypeScript/Node [cite:187] |
| Language Server | Parseo, diagnósticos, navegación, autocompletado, símbolos, modelo semántico | Java + LSP [cite:161][cite:194] |
| Webviews | Formularios, dashboards de ejecución, historial, artefactos, comparadores | HTML/CSS/JS o React [cite:162][cite:165] |

VS Code ejecuta las extensiones dentro del Extension Host, un proceso aislado del workbench principal para proteger la estabilidad y el rendimiento del editor. Este modelo es especialmente importante porque un plugin de Nextflow completo puede combinar tareas intensivas como parseo, indexación, seguimiento de procesos y renderizado de interfaces ricas.[cite:187][cite:193]

## Workbench de VS Code

El workbench es la superficie visible del usuario: editor, terminal, explorador, paneles laterales, barra de actividad y panel inferior. Desde el punto de vista del plugin, el workbench es el contenedor donde se proyecta la experiencia Nextflow, pero no debe contener lógica de negocio. Todas las capacidades específicas se exponen mediante comandos, árboles, paneles, diagnósticos y webviews registrados por la extensión.[cite:167]

Esta capa debe aprovechar al máximo los patrones nativos de VS Code para reducir fricción: vistas tipo árbol para proyectos y ejecuciones, panel inferior para logs, apertura de HTML en preview o navegador externo y comandos accesibles por paleta. Cuanto más se parezca la interacción a un flujo estándar de VS Code, menor será la curva de aprendizaje.[cite:165][cite:167]

## Extension Host

El Extension Host es el núcleo operativo del plugin. Aquí vive la lógica que detecta proyectos Nextflow, arranca el language server, registra comandos, mantiene el estado del workspace, coordina la ejecución local de `nextflow` y comunica ese estado a las webviews. Microsoft documenta esta capa como el entorno donde se ejecutan las extensiones y donde deben concentrarse las integraciones con la API del editor.[cite:187]

El Extension Host debe actuar como orquestador y frontera de confianza. La UI no debe lanzar procesos del sistema directamente; en su lugar, envía mensajes al host, que valida, resuelve rutas, compone comandos y expone solo la información necesaria de vuelta a los paneles. Esta decisión es clave tanto para seguridad como para mantenibilidad.[cite:162][cite:189]

## Language Server

La extensión oficial de Nextflow para VS Code se basa en un language server escrito en Java que implementa el Language Server Protocol. El cliente de la extensión es relativamente ligero y se limita a iniciar el servidor, establecer la conexión y traducir capacidades del LSP a interacciones dentro de VS Code, como hover, completado, navegación y diagnósticos.[cite:161][cite:194]

En un IDE completo, este componente debe seguir siendo el centro del análisis estático. Debe ser la fuente de verdad para símbolos, módulos, referencias, estructura del pipeline, diagnósticos y metadatos útiles para otras vistas. La capa TypeScript no debería duplicar parseadores ni lógica semántica; su función es consumir los resultados del LSP y transformarlos en experiencias de usuario más ricas.[cite:166][cite:194]

## Capa de ejecución de Nextflow

La capa de ejecución es el gran elemento diferenciador respecto a la extensión oficial. Su misión es convertir la CLI de Nextflow en un backend local gobernado por interfaz gráfica. Debe resolver el binario `nextflow`, construir comandos a partir de configuraciones visuales, lanzar procesos, transmitir logs en vivo, permitir cancelación y exponer el estado del run a otras partes del sistema.

Arquitectónicamente, esta capa debe estar desacoplada del language server. El lenguaje describe y valida el pipeline; el runtime lo ejecuta. Separar ambas preocupaciones permite evolucionar la experiencia operativa sin tocar la semántica y evita introducir dependencias circulares entre análisis y ejecución.

### Responsabilidades de la capa de ejecución

- Resolver el binario de Nextflow y validar su disponibilidad.
- Construir el comando final a ejecutar a partir de parámetros, perfiles y opciones.
- Lanzar `nextflow run`, `nextflow log` u otros comandos permitidos.
- Capturar stdout, stderr y código de salida.
- Permitir acciones como Stop, Resume y Re-run.
- Detectar artefactos generados por cada ejecución.
- Persistir el historial de runs y configuraciones.

## Webviews y paneles ricos

VS Code permite crear vistas completamente personalizadas mediante webviews. Este mecanismo es el más adecuado cuando la UX necesaria supera lo que ofrecen los componentes nativos de árbol, Quick Pick o formularios básicos. Microsoft documenta las webviews como contenedores potentes para experiencias personalizadas, pero también insiste en tratarlas como entornos aislados con comunicación por mensajes.[cite:162][cite:165]

En este plugin, las webviews deberían usarse para los paneles de parámetros, dashboards de ejecución, historial de runs, comparadores de configuraciones y exploradores de artefactos. La arquitectura recomendada es mantener la webview como cliente de presentación puro y usar el Extension Host como backend de estado y acciones, comunicándose mediante un protocolo explícito de mensajes.[cite:189]

## Flujo de datos y control

El flujo técnico general debería seguir esta secuencia:

1. El usuario abre un workspace.
2. La extensión detecta si hay un proyecto Nextflow.
3. El Extension Host arranca el cliente LSP.
4. El language server analiza scripts y configuraciones.
5. El host construye un modelo de proyecto enriquecido.
6. Las vistas nativas y webviews renderizan ese modelo.
7. El usuario define parámetros y lanza una ejecución.
8. La webview envía una acción al host.
9. El host compone y lanza el comando `nextflow`.
10. El host transmite logs, estado y artefactos a la interfaz.
11. El usuario inspecciona resultados, errores o relanza con `-resume`.

Este diseño deja muy claras las fronteras: análisis en el language server, orquestación en el host, renderizado en la UI. Esa claridad es uno de los principales criterios de calidad arquitectónica del plugin.

## Módulos recomendados

La extensión debería organizarse en módulos desacoplados y con contratos explícitos. Una estructura razonable sería la siguiente:

```text
src/
  extension/
    activate.ts
    commands/
    views/
    workspace/
    state/
  language/
    client/
    adapters/
    projectModel/
  execution/
    resolver/
    runBuilder/
    processRunner/
    artifactIndexer/
    runHistory/
  ui/
    webviews/
      params/
      runs/
      artifacts/
      compare/
    messaging/
  shared/
    types/
    events/
    contracts/
```

Esta estructura separa responsabilidades y facilita pruebas unitarias e integración gradual. También prepara el proyecto para evolucionar desde un MVP hacia un IDE más completo sin convertir el archivo principal de la extensión en un monolito difícil de mantener.

## Modelo de proyecto

El plugin necesita un modelo interno del workspace Nextflow. Ese modelo no sustituye al árbol de archivos real, sino que lo abstrae para la experiencia de dominio. Sus entidades mínimas deberían ser:

- `WorkspaceProject`
- `PipelineEntryPoint`
- `Module`
- `Profile`
- `RunConfiguration`
- `Run`
- `Artifact`
- `ParameterDefinition`
- `ExecutionEvent`

La entidad `RunConfiguration` debe separarse de `Run`. Una configuración describe una intención reusable; un run es una ejecución concreta con tiempo, estado, salida, errores y artefactos asociados. Esta separación será fundamental para presets, comparaciones y relanzamientos.

## Integración con la extensión oficial

La mejor estrategia técnica es convivir con la extensión oficial de Nextflow y apoyarse en ella cuando sea viable. La extensión oficial ya cubre soporte de lenguaje, validación, navegación, formato y una vista de proyecto respaldada por el language server. Intentar reconstruir esas capacidades desde cero aumentaría mucho la complejidad del producto sin aportar valor diferencial proporcional.[cite:166][cite:161]

La capa nueva del IDE debe centrarse en ejecución, observabilidad local, parametrización guiada e integración operacional. El producto gana valor no por reemplazar el soporte de lenguaje, sino por cerrar el hueco entre “editar” y “correr/entender” el pipeline dentro del mismo entorno.[cite:166][cite:177]

## Comunicación entre capas

La comunicación entre componentes debe seguir contratos estrictos. La webview no debe conocer detalles de Node, sistema de archivos o procesos hijos. Solo debe enviar mensajes bien tipados, por ejemplo `RUN_PIPELINE`, `STOP_RUN`, `OPEN_ARTIFACT`, `GET_RUN_HISTORY`, y recibir eventos como `RUN_STARTED`, `RUN_LOG_CHUNK`, `RUN_FINISHED`, `ARTIFACTS_UPDATED`.

El lenguaje y la ejecución también deben comunicarse de forma indirecta. La capa de ejecución puede consumir información derivada del language server, pero sin depender de estructuras internas inestables. Lo ideal es introducir adaptadores que traduzcan la semántica del LSP a un modelo de proyecto estable para el resto de la extensión.

## Soporte remoto

VS Code soporta escenarios remotos como SSH, contenedores y Codespaces. La documentación oficial destaca que una extensión debe diseñarse pensando en la posibilidad de que el Extension Host corra en un entorno diferente al del cliente gráfico. Para un plugin de Nextflow esto es especialmente relevante, porque el pipeline debe ejecutarse donde reside el workspace y donde están disponibles el runtime y los datos.[cite:191][cite:187]

Por ello, la arquitectura debe asumir desde el inicio que las rutas, procesos y acceso a archivos pueden ocurrir en un host remoto. La UI, sin embargo, seguirá renderizándose localmente. Esta separación debe reflejarse tanto en las APIs internas como en las pruebas.

## Seguridad

Una extensión que ejecuta comandos locales tiene una superficie sensible. La primera medida arquitectónica es mostrar siempre al usuario el comando final que se va a lanzar, con sus perfiles y parámetros ya resueltos. La segunda es centralizar la ejecución exclusivamente en el Extension Host. La tercera es tratar las webviews como clientes no confiables que solo se comunican por mensajes validados.[cite:162][cite:165]

También conviene definir una política clara sobre qué operaciones están permitidas: qué comandos se pueden construir, qué directorios se pueden abrir, qué artefactos se indexan y qué información se persiste. La transparencia y la previsibilidad del comportamiento son esenciales para que el plugin sea adoptado en entornos técnicos exigentes.

## Observabilidad interna del plugin

El propio plugin debe incorporar telemetría opcional y logs internos para diagnosticar fallos en activación, detección de proyectos, arranque del language server o ejecución de comandos. En fases tempranas, una vista de “diagnóstico del plugin” puede ser muy útil para validar el producto en beta cerrada.

A nivel arquitectónico, eso implica que cada módulo relevante emita eventos y métricas internas, y que exista una capa ligera de observabilidad que no dependa del UI principal. Esta información también ayudará a decidir qué partes del producto aportan más valor real a los usuarios.

## Testing y calidad

El testing debe seguir la misma estructura por capas. La lógica de construcción de comandos, resolución de rutas, parseo de configuraciones persistidas y normalización de eventos debe probarse con unit tests. Los providers de vista, el estado del workspace y la comunicación entre host y webviews deben cubrirse con pruebas de integración. Finalmente, el arranque del plugin y la ejecución de pipelines reales pequeños deben validarse con pruebas end-to-end.

También es recomendable probar explícitamente la convivencia con la extensión oficial de Nextflow. Si el producto se apoya en ella o la complementa, debe verificarse que no haya conflictos de activación, comandos, paneles o diagnósticos. Esta compatibilidad es un requisito técnico y de producto al mismo tiempo.[cite:166]

## Recomendación final

La arquitectura técnica óptima para un plugin de Nextflow completo en VS Code es una arquitectura de cliente fino, servidor de lenguaje dedicado y backend local de ejecución. El language server en Java debe seguir siendo la fuente principal de análisis semántico; el Extension Host en TypeScript/Node debe encargarse de orquestar estado, comandos y runtime; y las webviews deben implementar la experiencia visual avanzada mediante un protocolo de mensajes bien definido.[cite:161][cite:194][cite:162]

Este enfoque se alinea con la arquitectura ya adoptada por la extensión oficial de Nextflow y con las mejores prácticas documentadas por Microsoft para extensiones complejas de VS Code. Además, permite evolucionar el producto de forma incremental hacia un IDE especializado sin sacrificar claridad, seguridad ni capacidad de mantenimiento.[cite:166][cite:187][cite:165]
