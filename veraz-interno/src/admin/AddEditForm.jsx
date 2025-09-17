import { useState } from "react";

function todayISO(){ const d=new Date(); return d.toISOString().split("T")[0]; }
function toISODate(v){
  if(!v) return todayISO();
  if (typeof v==="object" && v?.seconds){ const d=new Date(v.seconds*1000); return d.toISOString().split("T")[0]; }
  if (v instanceof Date) return v.toISOString().split("T")[0];
  if (typeof v==="string"){
    const s=v.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    let m=s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
    m=s.match(/^(\d{2})[\/\-](\d{2})$/);
    if (m){ const y=new Date().getFullYear(); return `${y}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`; }
    return todayISO();
  }
  return todayISO();
}
const s = (v)=>String(v ?? "").trim();

const EMPTY = { persona:"", oficina:"", socios:"", observaciones:"", fecha: todayISO() };

export default function AddEditForm({ initial=EMPTY, onSubmit, submitLabel="Guardar", onCancel }) {
  const [form,setForm] = useState({ ...EMPTY, ...initial, fecha: toISODate(initial?.fecha) });
  const [busy,setBusy] = useState(false);

  function onChange(e){ const {name,value}=e.target; setForm(f=>({...f,[name]:value})); }

  async function handleSubmit(e){
    e.preventDefault(); setBusy(true);
    try{
      const payload = {
        persona: s(form.persona),
        oficina: s(form.oficina),
        socios: s(form.socios),
        observaciones: s(form.observaciones),
        fecha: toISODate(form.fecha),
      };
      await onSubmit?.(payload);
      setForm({ ...EMPTY, fecha: todayISO() });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form__grid">
        <input className="input" name="persona" value={form.persona} onChange={onChange} placeholder="Persona" required />
        <input className="input" name="oficina" value={form.oficina} onChange={onChange} placeholder="Oficina" />
        <input className="input" name="socios" value={form.socios} onChange={onChange} placeholder="Empresa/Personas Relacionadas" />
        <input className="input" type="date" name="fecha" value={form.fecha} readOnly disabled />
      </div>

      <textarea className="textarea" name="observaciones" value={form.observaciones} onChange={onChange} placeholder="Observaciones" />

      <div className="form__actions">
        {onCancel && <button type="button" onClick={onCancel} disabled={busy} className="btn btn--ghost">Cancelar</button>}
        <button type="submit" disabled={busy} className="btn btn--primary">{busy ? "Guardando…" : submitLabel}</button>
      </div>
    </form>
  );
}
