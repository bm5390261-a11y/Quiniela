// Hace que google.script.run funcione fuera de Apps Script, llamando a tu web app por fetch.
(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycby8d3FLjuH2tK-H80sOR-POAGKXHEQlqTAJjt5nR_OcTnIbgR2sGcIke9GnXTTgEDFVsQ/exec';
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
            .then(r => r.json())
            .then(j => { if (j && j.__error) throw new Error(j.__error); return j; })
            .then(j => ok && ok(j), e => fail && fail(e));
        };
      }
    });
  }
  window.google = { script: { run: runner(null, null) } };
})();
