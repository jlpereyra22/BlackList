// src/App.jsx
import './style/Index.css';
import Encabezado from './components/Encabezado';
import Buscador from './components/Buscador';
import TablaDatos from './components/TablaDatos';
import Pie from './components/Pie';

export default function App() {
  return (
    <div className="app">
      <Encabezado />

      <main className="contenido">
        <section className="zona-buscador">
          <Buscador />
        </section>

        <section className="zona-tabla">
          <TablaDatos />
        </section>
      </main>

      <Pie />
    </div>
  );
}
