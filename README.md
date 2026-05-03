# OneProtocol Web

Landing page estática para OneProtocol, enfocada en captar coaches profesionales y testers fundadores.

## Estructura

- `index.html`: landing principal para coaches.
- `register.html`: registro para coaches.
- `register-direct.html`: registro para OneProtocol Direct.
- `css/style.css`: estilos principales de la landing.
- `css/register.css`: estilos de formularios de registro.
- `images/`: capturas y visuales del producto.
- `icons/`: logo, favicon e íconos PWA.
- `sw.js`: service worker.
- `_headers`: headers de cache para Cloudflare Pages.

## Enfoque Actual

La página principal prioriza:

- captación de coaches testers/fundadores;
- explicación del sistema coach + cliente;
- builders de entrenamiento y nutrición;
- seguimiento, reportes y control de membresías;
- pricing con beneficio fundador;
- OneProtocol Direct como producto paralelo, sin competir con la oferta principal.

## Conversión

Los CTAs principales usan `data-track` y emiten eventos en `window.dataLayer` con el nombre `oneprotocol_cta_click`. Esto deja la base lista para conectar Google Tag Manager, GA4, Meta Pixel u otra herramienta sin volver a etiquetar los enlaces principales.

## Iconografía

Los íconos se manejan con un sprite SVG local en `index.html`, inspirado en la consistencia visual de [Tabler Icons](https://github.com/tabler/tabler-icons): grilla 24x24, trazo uniforme y sin dependencia externa.

## Despliegue

El sitio puede servirse como HTML estático. Para producción, mantener los assets versionados en los enlaces (`?v=...`) cuando haya cambios de CSS, imágenes o service worker.

## Pendientes Sugeridos

- Reemplazar `screenshots/website.png` por una captura real actual de OneProtocol.
- Conectar analytics y medir clics de registro, WhatsApp y pricing.
- Crear una página independiente para OneProtocol Direct si empieza a crecer como producto.
- Añadir testimonios reales cuando entren los primeros testers.
