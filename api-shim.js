// Hace que google.script.run funcione fuera de Apps Script, llamando a tu web app por fetch.
// Versión con diagnóstico: si algo falla, el error se muestra en pantalla.
(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycby8d3FLjuH2tK-H80sOR-POAGKXHEQlqTAJjt5nR_OcTnIbgR2sGcIke9GnXTTgEDFVsQ/exec';

  function mostrarError(e) {
    console.error('Quiniela:', e);
    const el = document.getElementById('partidos');
    if (el && /Cargando/.test(el.textContent)) {
      const p = document.createElement('p');
      p.style.cssText = 'text-align:center;color:#a22c28;font-weight:bold';
      p.textContent = (e && e.message) || 'No se pudo conectar con el servidor.';
      el.innerHTML = '';
      el.appendChild(p);
    }
  }

  function leerJson(r) {
    if (!r.ok) throw new Error('El servidor respondió con error ' + r.status + '.');
    return r.text().then(t => {
      try { return JSON.parse(t); }
      catch (_) { throw new Error('El servidor no devolvió datos. Revisa que la nueva versión esté publicada y que el acceso sea «Cualquier persona».'); }
    });
  }

  function runner(ok, fail) {
    return new Proxy({}, {
      get(_, nombre) {
        if (nombre === 'withSuccessHandler') return fn => runner(fn, fail);
        if (nombre === 'withFailureHandler') return fn => runner(ok, fn);
        return (...args) => {
          const pedido = nombre === 'registrarQuiniela'
            ? fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(args[0]) })
            : fetch(API_URL + '?fn=' + encodeURIComponent(nombre));
          pedido
            .then(leerJson)
            .then(j => { if (j && j.__error) throw new Error(j.__error); return j; })
            .then(j => ok && ok(j), e => (fail ? fail(e) : mostrarError(e)));
        };
      }
    });
  }
  window.google = { script: { run: runner(null, null) } };
})();
