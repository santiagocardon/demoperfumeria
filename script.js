(() => {
  // Aparición al hacer scroll (cuadrícula, líneas, contacto)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .linea:not(.d-linea)').forEach(el => io.observe(el));

  // Vista detallada
  const cards = [...document.querySelectorAll('.card')];
  const dlg = document.getElementById('detalle');
  const $ = id => document.getElementById(id);
  const img = $('d-img'), fila = dlg.querySelector('.d-fila');
  let cur = 0, lastFocus = null;

  const mostrar = (i) => {
    cur = (i + cards.length) % cards.length;
    const d = cards[cur].dataset;
    $('d-nombre').textContent = d.nombre;
    $('d-perfil').textContent = d.perfil;
    $('d-precio').textContent = d.precio;
    $('d-wa').href = d.wa;
    img.alt = d.nombre;
    img.src = d.img;
    fila.scrollTop = 0;
    const arrancar = () => { dlg.classList.remove('anim'); void dlg.offsetWidth; dlg.classList.add('anim'); };
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(arrancar);
  };

  const abrir = (i) => {
    lastFocus = document.activeElement;
    mostrar(i);
    dlg.classList.add('abierto');
    dlg.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    history.pushState({ detalle: true }, '');
    $('d-cerrar').focus({ preventScroll: true });
  };

  const cerrar = (desdePop) => {
    if (!dlg.classList.contains('abierto')) return;
    if (!desdePop && history.state && history.state.detalle) { history.back(); return; }
    dlg.classList.remove('abierto', 'anim');
    dlg.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  cards.forEach((c, i) => c.addEventListener('click', () => abrir(i)));
  $('d-cerrar').addEventListener('click', () => cerrar(false));
  $('d-prev').addEventListener('click', () => mostrar(cur - 1));
  $('d-next').addEventListener('click', () => mostrar(cur + 1));
  addEventListener('popstate', () => cerrar(true));
  addEventListener('keydown', (e) => {
    if (!dlg.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrar(false);
    if (e.key === 'ArrowLeft') mostrar(cur - 1);
    if (e.key === 'ArrowRight') mostrar(cur + 1);
  });

  // Deslizar con el dedo para cambiar de perfume
  let tx = 0, ty = 0;
  dlg.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  dlg.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) mostrar(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();