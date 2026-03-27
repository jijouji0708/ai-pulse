---
title: "Detrás de AI Pulse: Cómo operamos un medio digital con 7 agentes de IA autónomos"
description: "Siete agentes de IA recopilan noticias y escriben artículos de forma autónoma todos los días en AI Pulse. Así funciona, qué aprendimos de los éxitos y fracasos de la industria, nuestro diseño de seguridad y los desafíos que enfrentamos."
pubDate: "2026-03-25"
tags: ["Agentes IA", "Operaciones Autónomas", "AI Pulse", "Claude Code", "Sistemas Multi-Agente"]
originalSlug: "2026-03-25-ai-pulse-behind-the-scenes"
---

AI Pulse es un medio digital donde siete agentes de IA recopilan noticias, escriben artículos y los publican automáticamente todos los días. En este artículo les cuento por qué empezamos este proyecto, cómo funciona por dentro y los desafíos que honestamente seguimos enfrentando.

## El inicio — Cada vez más empresas operan con agentes de IA

A principios de 2026, empezaron a multiplicarse los casos de negocios operados completamente por agentes de IA. Me pregunté: ¿esto realmente funciona? Así que empecé investigando. Lo que encontré fue que tanto los éxitos impresionantes como los fracasos espectaculares son muy reales.

## Lo que reveló la investigación: luces y sombras

### Casos de éxito

**The Rundown AI** es un newsletter de IA que logró más de 2 millones de suscriptores. Un equipo reducido combinado con IA entrega contenido diario a un ritmo que ninguna redacción tradicional podría igualar ([fuente](https://www.therundown.ai/)).

**Mindstream**, una startup de medios impulsada por IA, creció lo suficiente como para ser adquirida por HubSpot, gigante del marketing digital ([fuente](https://www.hubspot.com/)). Demostró que los medios basados en IA pueden tener una estrategia de salida real.

El emprendedor **Jacob Bank** automatizó sus operaciones de marketing con 40 agentes de IA, construyendo un negocio de un millón de dólares con un equipo mínimo ([fuente](https://medium.com/)).

### Historias de advertencia

Del otro lado, han ocurrido incidentes graves. Un sistema multi-agente cayó en un bucle infinito donde dos IAs se enviaban solicitudes mutuamente, acumulando una factura de nube de **47,000 dólares**. Nadie se dio cuenta durante 11 días ([fuente](https://techstartups.com/2025/11/14/ai-agents-horror-stories-how-a-47000-failure-exposed-the-hype-and-hidden-risks-of-multi-agent-systems/)).

Un estudio de la Universidad Carnegie Mellon (CMU) llamado "TheAgentCompany" encontró que incluso la IA más avanzada completó solo el **24%** de las tareas de oficina. Le pides que haga cuatro cosas y termina una ([fuente](https://www.cs.cmu.edu/news/2025/agent-company)).

**Sports Illustrated**, una de las revistas deportivas más reconocidas de Estados Unidos, fue descubierta publicando artículos generados por IA bajo nombres de autores ficticios, lo que provocó el despido del CEO ([fuente](https://futurism.com/)). Una lección sobre lo que pasa cuando el uso de IA carece de transparencia.

Después de estudiar tanto los aciertos como los desastres, pensé: "Voy a diseñar esto con seguridad y probarlo yo mismo". Así nació AI Pulse.

## La arquitectura de 7 agentes

AI Pulse funciona con siete agentes de IA, cada uno con un rol específico y un horario establecido.

| Agente | Rol | Horario |
|---|---|---|
| **Research** | Recopila noticias de IA y tecnología | Diario a las 0:00 |
| **Content** | Escribe artículos basándose en la investigación | Diario a la 1:00 |
| **SEO/Editor** | Corrige, verifica hechos y optimiza para SEO | Después de Content |
| **Social** | Genera textos para X (antes Twitter) | Después de SEO/Editor |
| **Analytics** | Recopila KPIs y genera reportes semanales | Cada sábado |
| **Eval/Improve** | Evalúa la calidad de artículos e impulsa la mejora continua | Cada domingo |
| **CEO** | Revisa la estrategia general y da directrices | Cada domingo |

El jugador clave es el **Agente Eval/Improve**. Está inspirado en el patrón de auto-mejora propuesto por Andrej Karpathy (ex director de IA en Tesla). Cada semana califica los artículos anteriores, compara los de mayor y menor puntuación, y actualiza automáticamente nuestra guía de estilo de escritura. Como medida de seguridad, los cambios solo se aplican si artículos de prueba confirman una mejora real en las puntuaciones.

## Stack tecnológico — Empezamos completamente gratis

| Propósito | Herramienta | Costo |
|---|---|---|
| Framework del blog | Astro (generador de sitios estáticos) | Gratis |
| Hosting | GitHub Pages | Gratis |
| Plataforma de agentes | Claude Code Scheduled Tasks | Incluido en suscripción existente |
| Control de versiones | Git + GitHub | Gratis |

Astro es un generador de sitios estáticos que pre-construye archivos HTML, ofreciendo tiempos de carga rápidos y buen rendimiento SEO. GitHub Pages aloja sitios estáticos gratis. En resumen, aparte del nombre de dominio (aproximadamente 12 dólares al año), no hay costos operativos adicionales.

## Comunicación entre agentes basada en archivos

Siete agentes actuando de forma independiente serían un caos. Por eso AI Pulse usa un sistema de comunicación basado en archivos.

```
agents/
├── research/daily/2026-03-25.md   ← Escrito por Research
├── content/drafts/2026-03-25-*.md ← Escrito por Content
├── seo-editor/reviewed/*.md       ← Escrito por SEO/Editor
└── ...
```

Las reglas son simples:

- Cada agente **solo puede escribir en su propia carpeta**
- Las carpetas de otros agentes son de **solo lectura**
- Las directrices del Agente CEO van en `shared/communication/`

Por ejemplo, el Agente Content lee `research/daily/2026-03-25.md` escrito por el Agente Research y redacta un artículo basándose en eso. Pero nunca puede escribir directamente en la carpeta de Research. Esta restricción evita que los agentes sobrescriban los archivos de los demás.

No se necesitan bases de datos ni colas de mensajes. La comunicación funciona solo con archivos y carpetas, lo que hace que resolver problemas sea sencillo.

## Diseño de seguridad — Para nunca repetir el incidente de los 47,000 dólares

¿El bucle descontrolado de 47,000 dólares que encontramos en nuestra investigación? Construimos AI Pulse específicamente para asegurarnos de que eso nunca pase aquí.

**1. Límites de tiempo de ejecución**
Cada agente tiene un tiempo máximo de ejecución. Research tiene 15 minutos, Content tiene 30 minutos. Si se acaba el tiempo, el agente se detiene forzosamente.

**2. Permisos mínimos**
Los agentes solo reciben los permisos estrictamente necesarios para sus tareas. Escribir en APIs externas está prohibido. Eliminar archivos está prohibido. Solo pueden crear archivos nuevos o sobrescribir existentes.

**3. Aprobación humana obligatoria**
Los agentes generan borradores, pero la publicación real en el blog o redes sociales requiere revisión y aprobación humana.

**4. Autonomía gradual**
No pusimos todo en automático desde el día uno. Empezamos con revisión humana de cada resultado, y vamos reduciendo la supervisión a medida que el sistema demuestra ser confiable.

**5. Transparencia en cada artículo**
Aprendiendo del caso de Sports Illustrated, cada artículo incluye un pie de página que indica claramente que fue generado por IA.

## Resultados del primer día — 10 artículos publicados en 2 días

En los primeros dos días, generamos y publicamos 10 artículos. Los temas incluyeron desde comparativas de herramientas de programación con IA hasta guías de ingeniería de prompts — contenido útil para usuarios de IA desde principiantes hasta nivel intermedio.

La generación en sí es rápida. Research recopila noticias, Content escribe el artículo, SEO/Editor lo pule. Este proceso toma aproximadamente una hora por artículo. Un escritor humano necesitaría medio día para el mismo trabajo.

## Desafíos honestos — Lo que aún no hemos resuelto

Las cosas pueden parecer bien, pero seamos honestos. Los desafíos se acumulan.

**Problemas de permisos para Git Push**
Incluso después de que los agentes escriben artículos, hacer push a GitHub (el paso de publicación) todavía requiere intervención humana. La publicación totalmente automatizada aún no funciona.

**Variación en la calidad**
De los 10 artículos, algunos estaban listos para publicar mientras que otros necesitaban edición significativa. El ciclo de auto-mejora del Agente Eval debería ayudar, pero aún no tenemos suficientes datos.

**Cero lectores**
Escribimos 10 artículos en dos días, pero la audiencia es prácticamente cero. Escribir artículos y lograr que la gente los lea son problemas completamente diferentes. El SEO normalmente tarda de 3 a 6 meses en dar resultados, así que se necesita paciencia.

**Limitaciones en la verificación de hechos**
El Agente Research recopila información de la web, pero la verificación final de precisión todavía depende de un humano. La verificación de hechos perfecta solo con IA aún no es posible.

## Próximos pasos

**Corto plazo (dentro de 1 mes)**
- Activar completamente el ciclo de auto-mejora del Agente Eval
- Empezar a publicar en X (antes Twitter) para construir audiencia
- Estabilizar la producción en 30 artículos por mes

**Mediano plazo (3 meses)**
- Alcanzar 500 suscriptores
- Introducir ingresos por publicidad
- Usar este sistema operado por agentes como portafolio para servicios de consultoría en IA

**Largo plazo (6 meses+)**
- 2,000 suscriptores y 50,000 vistas mensuales
- Escalar la consultoría de desarrollo de agentes de IA para empresas
- Usar AI Pulse como prueba de que los agentes de IA pueden operar un negocio real

## Conclusión — Operar con agentes de IA es posible, pero no es fácil

Esto es lo que aprendimos al lanzar AI Pulse: operar un medio digital con agentes de IA es técnicamente posible. Construimos un sistema donde siete agentes generan artículos automáticamente todos los días, usando un stack tecnológico completamente gratuito, en solo dos días.

Pero "posible" y "exitoso" son cosas diferentes. Control de calidad, crecimiento de audiencia, diseño de seguridad y, sobre todo, supervisión humana — todo esto requiere esfuerzo constante y persistente.

Este meta-artículo es en sí mismo parte del experimento de AI Pulse. Seguiremos compartiendo nuestro progreso con honestidad — tanto los aciertos como los fracasos.

---

*Este artículo fue generado por IA y revisado por humanos.*
