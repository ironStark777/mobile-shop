import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { focusPageHeading } from '../shared/lib/focusPageHeading';

/**
 * React Router no mueve el foco al cambiar de página, y el enlace pulsado desaparece. Al volver de
 * un producto, el foco pasa a su tarjeta del listado; si no está, o en cualquier otra página, al
 * título. No actúa en la primera carga ni cuando solo cambia la búsqueda (`?q=`).
 */
export function useFocusAfterNavigation(): void {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const previous = previousPathname.current;
    if (pathname === previous) {
      return;
    }
    previousPathname.current = pathname;

    const cardLinks = document.querySelectorAll<HTMLAnchorElement>('main article a');
    const linkToPrevious = [...cardLinks].find((link) => link.getAttribute('href') === previous);
    if (linkToPrevious === undefined) {
      focusPageHeading();
      return;
    }
    // `ScrollRestoration` ya ha recuperado la posición: si la tarjeta se ve, aunque sea en parte,
    // no se desplaza la página. Solo si ha quedado fuera de la vista, el navegador la busca.
    const card = linkToPrevious.closest('article') ?? linkToPrevious;
    const { top, bottom } = card.getBoundingClientRect();
    const isInView = bottom > 0 && top < window.innerHeight;
    linkToPrevious.focus({ preventScroll: isInView });
  }, [pathname]);
}
