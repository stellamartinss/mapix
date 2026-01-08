import './styles/FloatingButton.css';

export default function FloatingButton({ 
  icon, 
  label, 
  onClick, 
  position = 'bottom-right',
  badge,
  active = false
}) {
  return (
    <button
      onClick={onClick}
      className={`floating-btn panel-toggle-btn floating-btn-${position} ${active ? 'active' : ''}`}
      aria-label={label}
      title={label}
    >
      <span className="floating-btn-icon">{icon}</span>
      {badge && <span className="floating-btn-badge">{badge}</span>}
    </button>
  );
}
