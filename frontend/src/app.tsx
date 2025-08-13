import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  const [objective, setObjective] = useState("");
  const [okr, setOkr] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [kr, setKr] = useState({ def: "", val: "", date: "" });
  const [krs, setKrs] = useState<any[]>([]);
  const [krLoading, setKrLoading] = useState(false);

  async function submitObjective(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOkr(null);
    try {
      const res = await fetch(`${API}/api/v1/okrs/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error");
      setOkr(data);
    } catch (err:any) {
      alert(err.message);
    } finally { setLoading(false); }
  }

  async function submitKr(e: React.FormEvent) {
    e.preventDefault();
    setKrLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/okrs/kr/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          okr_id: okr.okr_id,
          kr_definition: kr.def,
          target_value: kr.val,
          target_date: kr.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error");
      setKrs(prev => [...prev, data]);
      setKr({ def: "", val: "", date: "" });
    } catch (err:any) {
      alert(err.message);
    } finally { setKrLoading(false); }
  }

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>OKR Evaluator (Front)</h1>

      <form onSubmit={submitObjective}>
        <label>Objectiu</label>
        <textarea value={objective} onChange={(e)=>setObjective(e.target.value)} rows={6} style={{width:"100%"}} />
        <button disabled={loading || !objective.trim()}>{loading? "Avaluant..." : "Enviar"}</button>
      </form>

      {okr && (
        <section>
          <h3>Resultat</h3>
          <pre>{JSON.stringify(okr, null, 2)}</pre>
        </section>
      )}

      {okr?.can_add_krs && (
        <section>
          <h3>Afegir KR</h3>
          <form onSubmit={submitKr} style={{ display: "grid", gridTemplateColumns: "1fr 200px 180px 120px", gap: 8, alignItems: "end" }}>
            <div>
              <label>Resultat clau</label>
              <input value={kr.def} onChange={(e)=>setKr(prev=>({...prev, def:e.target.value}))} style={{width:"100%"}} />
            </div>
            <div>
              <label>Valor objectiu</label>
              <input value={kr.val} onChange={(e)=>setKr(prev=>({...prev, val:e.target.value}))} />
            </div>
            <div>
              <label>Data</label>
              <input type="date" value={kr.date} onChange={(e)=>setKr(prev=>({...prev, date:e.target.value}))} />
            </div>
            <button disabled={krLoading || !kr.def || !kr.val || !kr.date}>{krLoading? "..." : "OK"}</button>
          </form>

          <h4>KRs</h4>
          <ul>
            {krs.map((x,i)=>(<li key={i}><pre>{JSON.stringify(x,null,2)}</pre></li>))}
          </ul>
        </section>
      )}
    </main>
  );
}
