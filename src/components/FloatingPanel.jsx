import { useEffect, useRef } from 'react';
import './styles/FloatingPanel.css';

export default function FloatingPanel({ 
  isOpen, 
  onClose, 
  position = 'right', 
  children,
  title 
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        // Check if click is on a toggle button
        const isToggleButton = event.target.closest('.panel-toggle-btn');
        if (!isToggleButton) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div 
      ref={panelRef}
      className={`floating-panel floating-panel-${position} ${isOpen ? 'open' : ''}`}
    >
      <div className="floating-panel-header">
        {title && <h3 className="floating-panel-title">{title}</h3>}
        <button 
          onClick={onClose} 
          className="floating-panel-close"
          aria-label="Fechar painel"
        >
          ✕
        </button>
      </div>
      <div className="floating-panel-content">
        {children}
      </div>
    </div>
  );
}
