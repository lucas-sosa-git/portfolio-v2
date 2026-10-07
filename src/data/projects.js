const projectImages = {
  vla: new URL("../../assets/projects/vla.png", import.meta.url).href,
  rojas: new URL("../../assets/projects/rojas.png", import.meta.url).href,
  ids: new URL("../../assets/projects/ids-turnos.svg", import.meta.url).href,
};

export const projects = [
  {
    id: "vla-mermas",
    title: "Control de mermas en retail",
    eyebrow: "Automatización y BI",
    status: "En producción",
    impact:
      "Reduje de varios días a cerca de una hora el procesamiento manual de datos para reportes confiables.",
    cardRole: "Automatización y análisis · Python, Pandas, SQL, Power BI",
    summary:
      "Automatización del procesamiento y la validación de datos de productos y mermas para generar reportes confiables.",
    problem:
      "Preparar, cruzar y corregir datos que antes demandaban varios días de trabajo manual.",
    role: "Automatización y análisis de datos",
    challenge:
      "Convertir fuentes heterogéneas y errores de calidad en un proceso trazable y repetible para alimentar el reporte.",
    result:
      "El proceso pasó de varios días de trabajo manual a ejecutarse en aproximadamente una hora.",
    learning:
      "Un buen reporte empieza con validación, trazabilidad y control de errores; la visualización viene después.",
    technologies: ["Python", "Pandas", "SQL", "Power BI"],
    image: projectImages.vla,
    imageAlt: "Gráfico anual de mermas y sus indicadores principales en Power BI",
    liveUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiYjFkZWJjZjQtOGZjNi00NDg5LWJkOTUtNDExYTEyNzAxMGViIiwidCI6ImEyMmNjNzFiLTA5MjQtNDQ4YS1hOTJhLTRiNjNlYjZkOWE3NiIsImMiOjR9",
    primaryLabel: "Ver reporte",
  },
  {
    id: "proyecto-rojas",
    title: "Web para consultorio odontológico",
    eyebrow: "Desarrollo web · Equipo",
    status: "Cliente real",
    impact:
      "Organicé la información del consultorio en un sitio responsive para que sus pacientes encuentren tratamientos y turnos.",
    cardRole: "Desarrollo web en equipo · HTML, CSS, JavaScript",
    summary:
      "Sitio responsive que organiza el contenido institucional de un consultorio odontológico.",
    problem:
      "Traducir las necesidades de un cliente en una presencia web simple, clara y accesible.",
    role: "Desarrollo web en equipo",
    challenge:
      "Ordenar contenido y decisiones visuales con el equipo para responder a una necesidad concreta del cliente.",
    result:
      "Un primer producto web construido en equipo y pensado para usuarios reales.",
    learning:
      "Desarrollar para otras personas implica escuchar, simplificar, priorizar y adaptar la solución a una necesidad concreta.",
    technologies: ["HTML", "CSS", "JavaScript", "Responsive"],
    image: projectImages.rojas,
    imageAlt: "Portada del sitio del consultorio odontológico Rojas",
    githubUrl: "https://github.com/XeonnNK/Dental_Rojas",
    primaryLabel: "Ver código",
  },
  {
    id: "gestor-turnos-ids",
    title: "Sistema de turnos y reservas",
    eyebrow: "Aplicación web · Equipo",
    status: "Proyecto académico",
    impact:
      "Integré reservas, roles de usuario, cancelaciones, reseñas y confirmaciones por email y QR en una sola aplicación.",
    cardRole: "Desarrollo full-stack · Flask, SQL, JWT, Supabase Storage",
    summary:
      "Sistema web académico para gestionar reservas, roles, cancelaciones, reseñas y confirmaciones por email y QR.",
    problem:
      "Resolver un flujo de turnos real con permisos diferenciados para clientes, profesionales y administración.",
    role:
      "Desarrollo full-stack en equipo: integración de frontend, backend, autenticación, permisos, almacenamiento y control de versiones.",
    challenge:
      "Coordinar los flujos entre interfaces, API y persistencia, sostener los roles con JWT e integrar Supabase Storage dentro de una base compartida por el equipo.",
    result:
      "Aplicación operativa desarrollada en equipo, con roles diferenciados, autenticación y almacenamiento de imágenes.",
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
    image: projectImages.ids,
    imageAlt:
      "Mockup de la agenda y arquitectura del sistema de turnos con Flask, JWT, SQL y Supabase Storage",
    githubUrl: "https://github.com/lucas-sosa-git/gestor-de-turnos-IDS",
    primaryLabel: "Ver código",
  },
];
