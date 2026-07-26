const projectImage = (filename) =>
  new URL(`../../assets/projects/${filename}`, import.meta.url).href;

export const projects = [
  {
    id: "gestor-turnos-ids",
    title: "Gestor de Turnos IDS",
    eyebrow: "Full-stack colaborativo",
    status: "Proyecto destacado",
    summary:
      "Sistema web académico para gestionar reservas, roles, cancelaciones, reseñas y confirmaciones por mail y QR.",
    problem:
      "Resolver un flujo real de turnos y separar permisos para clientes, profesionales y administración.",
    role:
      "Desarrollo full-stack colaborativo: integración de frontend y backend, autenticación, permisos, almacenamiento y control de versiones.",
    challenge:
      "Coordinar los flujos entre interfaces, API y persistencia, sostener los roles con JWT e integrar Supabase Storage dentro de una base compartida por el equipo.",
    result:
      "Aplicación operativa construida en equipo, con responsabilidades separadas, autenticación y almacenamiento de imágenes.",
    learning:
      "Consolidé la integración de una aplicación de punta a punta. Git y Docker acompañaron el desarrollo y la integración local; Docker no se presenta como despliegue productivo.",
    technologies: [
      "Flask",
      "Jinja",
      "SQL",
      "JWT",
      "Supabase Storage",
      "Git",
      "Docker",
    ],
    image: projectImage("ids-turnos.svg"),
    imageAlt:
      "Arquitectura del Gestor de Turnos IDS con frontend, backend, JWT, SQL y Supabase Storage",
    githubUrl: "https://github.com/lucas-sosa-git/gestor-de-turnos-IDS",
    primaryLabel: "Ver código",
  },
  {
    id: "vla-mermas",
    title: "VLA · Mermas retail",
    eyebrow: "Data Quality · BI",
    status: "Producción",
    summary:
      "Automatización del procesamiento y validación de información de productos y mermas para reportes confiables.",
    problem:
      "Preparar, cruzar y corregir datos que antes requerían varios días de trabajo manual.",
    role: "Automatización y análisis de datos",
    challenge:
      "Convertir fuentes heterogéneas y errores de calidad en un proceso trazable, repetible y apto para alimentar el reporte.",
    result:
      "El flujo pasó de varios días de trabajo manual a ejecutarse en aproximadamente una hora.",
    learning:
      "Un buen dashboard empieza por validación, trazabilidad y control de errores; la visualización viene después.",
    technologies: ["Python", "Pandas", "SQL", "Power BI"],
    image: projectImage("vla.png"),
    imageAlt: "Tablero de mermas VLA en Power BI",
    liveUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiYjFkZWJjZjQtOGZjNi00NDg5LWJkOTUtNDExYTEyNzAxMGViIiwidCI6ImEyMmNjNzFiLTA5MjQtNDQ4YS1hOTJhLTRiNjNlYjZkOWE3NiIsImMiOjR9",
    primaryLabel: "Ver reporte",
  },
  {
    id: "matching-gpc-cpc",
    title: "Matching GPC ↔ CPC",
    eyebrow: "IA aplicada · NLP",
    status: "Experimento",
    summary:
      "Prueba de equivalencias semánticas entre taxonomías mediante embeddings y búsqueda por similitud.",
    problem:
      "Comparar categorías con descripciones distintas para detectar candidatos de equivalencia.",
    role: "Exploración y validación técnica",
    challenge:
      "Distinguir similitud lingüística de equivalencia funcional y hacer visibles los falsos positivos del modelo.",
    result:
      "Candidatos de coincidencia y criterios más claros para evaluar precisión y limitaciones.",
    learning:
      "Aplicar IA exige medir precisión, revisar falsos positivos y validar cada criterio con conocimiento funcional.",
    technologies: ["Python", "Embeddings", "Hugging Face", "FAISS"],
    image: projectImage("gpc-cpc.webp"),
    imageAlt: "Matching de categorías GPC y CPC con embeddings",
    liveUrl: "#contact",
    primaryLabel: "Consultar caso",
  },
  {
    id: "portfolio-personal",
    title: "Portfolio personal",
    eyebrow: "Frontend · UX",
    status: "Marca profesional",
    summary:
      "Sitio responsive para presentar experiencia, proyectos, aprendizajes y foco profesional con lectura rápida.",
    problem:
      "Convertir experiencia técnica dispersa en una narrativa clara para recruiters y equipos técnicos.",
    role: "Diseño y desarrollo frontend",
    challenge:
      "Combinar una identidad visual profunda con navegación accesible, rendimiento y una lectura clara en distintas pantallas.",
    result:
      "Una experiencia accesible para comunicar proyectos técnicos y mostrar evolución profesional.",
    learning:
      "Aprendí a equilibrar diseño, accesibilidad, rendimiento y comunicación en una base mantenible.",
    technologies: ["HTML", "CSS", "JavaScript", "Accesibilidad"],
    image: projectImage("portfolio.png"),
    imageAlt: "Portfolio personal de Lucas Sosa",
    githubUrl: "https://github.com/lucas-sosa-git/portfolio-v2",
    primaryLabel: "Ver código",
  },
  {
    id: "nubenta-pos",
    title: "Nubenta · POS",
    eyebrow: "Producto propio · Web App",
    status: "En desarrollo",
    summary:
      "Aplicación tipo POS para gestionar ventas, inventario, caja y la operación diaria de comercios.",
    problem:
      "Diseñar un producto útil para comercios y sostener su evolución técnica de manera incremental.",
    role: "Producto y desarrollo en equipo",
    challenge:
      "Priorizar flujos de negocio conectados sin perder claridad entre inventario, ventas, caja y evolución técnica.",
    result:
      "Un laboratorio de producto real donde conviven arquitectura, UX, despliegue y decisiones de negocio.",
    learning:
      "Estoy aprendiendo a pensar en alcance, prioridades, deuda técnica, estados de negocio y coordinación.",
    technologies: ["React", "SQLAlchemy", "Render", "GitHub"],
    image: projectImage("nubenta.png"),
    imageAlt: "Dashboard de Nubenta POS",
    liveUrl: "https://pos-pyme.vercel.app/",
    primaryLabel: "Ver demo",
  },
  {
    id: "gs1-qr-code",
    title: "Demo GS1 QR Code",
    eyebrow: "Demo técnica · Prototipado",
    status: "GS1",
    summary:
      "Frontend que interpreta GTIN, lote, vencimiento y código de material desde un GS1 Digital Link.",
    problem:
      "Validar y comunicar rápidamente cómo visualizar la información codificada en una URL GS1.",
    role: "Prototipado frontend",
    challenge:
      "Traducir identificadores y atributos técnicos en una interfaz comprensible para validar el flujo con rapidez.",
    result:
      "Una demo funcional para probar el flujo sin construir primero un sistema completo.",
    learning:
      "Cuando una idea técnica es difícil de explicar, un prototipo pequeño acelera la conversación y la validación.",
    technologies: ["HTML", "CSS", "JavaScript", "GS1 Digital Link"],
    image: projectImage("gs1-qr-code.png"),
    imageAlt: "Demo de GS1 Digital Link para Purina",
    liveUrl:
      "https://gs1-purina.vercel.app/01/8445290971326/10/L001?17=260329&240=COD1234",
    primaryLabel: "Ver demo",
  },
  {
    id: "proyecto-rojas",
    title: "Proyecto Rojas · Web",
    eyebrow: "Web institucional · Equipo",
    status: "Cliente real",
    summary:
      "Sitio responsive con contenido institucional ordenado para un consultorio odontológico.",
    problem:
      "Traducir las necesidades de un cliente en una presencia web simple, clara y accesible.",
    role: "Desarrollo web en equipo",
    challenge:
      "Ordenar contenido y decisiones visuales con el equipo para responder a una necesidad concreta del cliente.",
    result:
      "Un primer producto web pensado para usuarios reales y construido de manera colaborativa.",
    learning:
      "Desarrollar para otros implica escuchar, simplificar, priorizar y adaptar la solución a una necesidad concreta.",
    technologies: ["HTML", "CSS", "JavaScript", "Responsive"],
    image: projectImage("rojas.png"),
    imageAlt: "Sitio web del consultorio odontológico Rojas",
    githubUrl: "https://github.com/XeonnNK/Dental_Rojas",
    primaryLabel: "Ver código",
  },
];
