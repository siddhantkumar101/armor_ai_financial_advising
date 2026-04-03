export default function Navbar({ status, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🛡️</span>
        <span className="brand-name">Armor</span>
        <span className="brand-tag">Financial Intelligence</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div className="nav-status">
          <span
            className="status-dot"
            style={status.color ? { background: status.color } : {}}
          ></span>
          {status.text}
        </div>

        {user && (
          <div className="user-profile">
            <span className="user-name">👋 {user.name}</span>
            <button onClick={onLogout} className="btn btn-sm btn-logout">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
