export default function Navbar({ status }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🛡️</span>
        <span className="brand-name">Armor</span>
        <span className="brand-tag">Financial Intelligence</span>
      </div>
      <div className="nav-status">
        <span
          className="status-dot"
          style={status.color ? { background: status.color } : {}}
        ></span>
        {status.text}
      </div>
    </nav>
  );
}
