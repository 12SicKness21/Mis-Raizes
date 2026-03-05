---
name: Cumplimiento Legal España (LSSICE y RGPD)
description: Guía y directrices para implementar páginas legales (Aviso Legal, Privacidad, Cookies) y banner de consentimiento.
---

# Implementación de Páginas Legales y Banner de Cookies (España)

Esta skill documenta el proceso y los requisitos para cumplir con la legalidad española (LSSICE y RGPD) en sitios web.

## 1. Páginas Legales Obligatorias

Toda página web comercial o corporativa en España debe tener enlaces visibles (generalmente centralizados en el footer) a las siguientes páginas:

*   **Aviso Legal:** Contiene los datos identificativos del propietario de la web (Nombre/Razón Social, NIF/CIF, Dirección, Teléfono, Datos Registrales si los hubiera). Establece las condiciones de uso de la plataforma.
*   **Política de Privacidad:** Informa detalladamente sobre qué datos personales se recogen (ej. números de teléfono en reservas, IPs en analíticas), cuál es la finalidad del tratamiento, la base legal, el responsable, los posibles destinatarios (ej. si se usa infraestructura de terceros como Firebase/Google) y explica al usuario cómo ejercer sus derechos (Acceso, Rectificación, Supresión, Oposición, Portabilidad).
*   **Política de Cookies:** Explica qué son las cookies, el listado o tipología de las cookies que usa concretamente la web (comúnmente técnicas/esenciales y analíticas), y describe las instrucciones para que el usuario pueda configurarlas, bloquearlas o eliminarlas desde las opciones de su navegador. También debe proveer un atajo para revocar el consentimiento previamente dado.

## 2. Banner de Consentimiento de Cookies (Opt-in)

No es suficiente con mostrar un aviso de que se usan cookies ("Si sigues navegando aceptas..."). Es obligatorio recoger el **consentimiento explícito, informado e inequívoco** antes de instalar cookies que no sean estrictamente técnicas/esenciales.

### Requisitos Funcionales del Banner:
1.  **Bloqueo por defecto:** Los scripts de analítica (Analytics), marketing (Píxeles), etc., NO deben ejecutarse hasta que el usuario haya hecho clic en "Aceptar".
2.  **Información Clara en primera capa:** El texto del banner debe indicar de forma resumida qué cookies se usan (propias y de terceros) y para qué fin.
3.  **Igualdad de Opciones:** Debe haber botones claramente visibles y al mismo nivel para:
    *   "Aceptar todas"
    *   "Rechazar todas" (o "Solo esenciales")
    *   Enlace a la Política de Cookies para más información.
4.  **Revocación sencilla:** El usuario debe poder retirar su consentimiento con la misma facilidad con la que lo dio. Esto se suele solucionar añadiendo un botón en la Política de Cookies para volver a mostrar el banner, o un pequeño icono flotante permanente.

## 3. Patrón de Implementación Técnica (JavaScript)

Un patrón común de implementación usando Vanilla JS y `localStorage`:

1.  **Bloqueo base:** La inicialización de herramientas como Google Analytics (`gtag('consent', 'default', { 'analytics_storage': 'denied' })`) o Firebase Analytics debe estar condicionada o en modo de consentimiento denegado por defecto.
2.  **Lógica del Banner:** Un script inicial verifica el estado del `localStorage`.
    *   Si no hay estado: Muestra la UI del banner.
    *   Si el usuario hace clic en "Aceptar": Guarda el estado `all` en `localStorage`, oculta el banner, y dispara la función que activa o da permiso a los servicios analíticos.
    *   Si el usuario hace clic en "Rechazar": Guarda el estado `essential` en `localStorage` y oculta el banner sin ejecutar la analítica.
3.  **Persistencia:** En futuras visitas/cargas de página, el script lee el `localStorage` de nuevo y evalúa silenciosamente si debe activar la analítica.
