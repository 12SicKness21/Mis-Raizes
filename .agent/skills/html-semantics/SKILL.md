---
name: HTML Semantics and Accessibility
description: Buenas prácticas de jerarquía de encabezados, SEO y accesibilidad en el desarrollo web.
---

# HTML Semantics, SEO, and Accessibility Best Practices

Al construir, revisar o corregir código HTML, se debe garantizar que cumpla con una arquitectura semántica correcta para maximizar el SEO y la accesibilidad (lectores de pantalla).

## 1. Jerarquía de Encabezados (H1-H6)
- **El H1 es obligatorio**: Cada página DEBE tener un `<h1>` principal que describa el tema o propósito central de la URL.
- **H1 Oculto para SEO/Accesibilidad**: Si el diseño visual usa un logo en lugar de texto o no tiene espacio para un gran título `<h1>`, se debe agregar un `<h1>` oculto visualmente usando clases como `sr-only` de Tailwind (`<h1 class="sr-only">Título</h1>`).
- **No saltar niveles**: Nunca pases de un nivel de encabezado mayor a uno mucho menor directamente (por ejemplo, saltar de `<h1>` a `<h3>`). La jerarquía debe ser siempre secuencial (`<h1>` -> `<h2>` -> `<h3>` ...).
- **Semántica vs. Diseño**: NUNCA usar etiquetas de encabezado (`<h1>` a `<h6>`) simplemente para hacer que un texto se vea más grande o en negrita. Si el texto no introduce una nueva sección de contenido, se debe usar `<div>`, `<p>` o `<span>` y aplicar las clases de CSS / Tailwind necesarias para lograr el tamaño deseado.

## 2. Botones y Navegación vs. Encabezados
- Los botones, enlaces de navegación, o tarjetas que redirigen a otras páginas (como "Carta", "Reseñas", "Ubicación") NO deben llevar etiquetas de encabezado como `<h2>` o `<h3>`. Puesto que son enlaces, deben ser anclas `<a>` con texto o elementos genéricos (`<div>`, `<span>`) en su interior. 
- Solo se usa un encabezado para estos términos si realmente inician una larga sección de contenido de lectura en la misma página (ej: `<section><h2>Carta</h2>...contenido...</section>`).

## 3. Aplicación en futuras tareas
Revisar de forma proactiva la estructura semántica de los documentos HTML cada vez que se trabaje en ellos, aplicando estas reglas automáticamente.
