import { useAuth } from "../auth/AuthProvider";
import "../style/TopBar.css";

export default function TopBar({ title = "Veraz Interno", right = null }) {
  const { user, signOut } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">{title}</h1>
      </div>

      <div className="topbar__right">
        {right}
        <div className="topbar__user">
          {/* chip con correo, truncado si es largo */}
          {user?.email && (
            <span className="userchip" title={user.email}>
              {user.email}
            </span>
          )}
          <button className="btn btn--danger" onClick={signOut}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
