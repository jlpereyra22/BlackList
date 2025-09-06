export function normalizarFila(r) {
  const persona = r.persona ?? r.Persona ?? '';
  const observaciones = r.observaciones ?? r.Observaciones ?? '';
  const sociosRaw = r.socios ?? r.Socios ?? [];
  const oficina = r.oficina ?? r.Oficina ?? '';
  const fechaStr = r.fecha ?? r.Fecha ?? '';

  let ts = NaN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [y, m, d] = fechaStr.split('-');
    ts = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
    const [d, m, y] = fechaStr.split('/');
    ts = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  }

  const socios = Array.isArray(sociosRaw)
    ? sociosRaw
    : typeof sociosRaw === 'string' && sociosRaw.trim()
    ? sociosRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return { persona, observaciones, socios, oficina, fecha: fechaStr, ts };
}

export function normalizarConjunto(arr) {
  return (Array.isArray(arr) ? arr : []).map(normalizarFila);
}
