import PropTypes from 'prop-types';
import './styles/FloatingButton.css';

export default function FloatingButton({ 
  icon, 
  label, 
  onClick, 
  position = 'bottom-right',
  badge,
  active = false,
  showText = false
}) {
  return (
    <button
      onClick={onClick}
      className={`floating-btn panel-toggle-btn floating-btn-${position} ${active ? 'active' : ''} ${showText ? 'floating-btn-with-text' : ''}`}
      aria-label={label}
      title={label}
    >
      <span className="floating-btn-icon">{icon}</span>
      {showText && <span className="floating-btn-label">{label}</span>}
      {badge && <span className="floating-btn-badge">{badge}</span>}
    </button>
  );
}

FloatingButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  position: PropTypes.oneOf([
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'left-center',
    'right-center'
  ]),
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  active: PropTypes.bool,
  showText: PropTypes.bool
};
