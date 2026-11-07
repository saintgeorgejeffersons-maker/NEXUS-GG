import { useState, useEffect, useRef, useCallback } from 'react';
import { Headphones, X } from 'lucide-react';
import { getSettings } from '../../lib/db';

const STORAGE_KEY = 'nexusgg_support_widget_pos';
const FAB_SIZE = 44;
const DEFAULT_POS = { x: window.innerWidth - FAB_SIZE - 16, y: window.innerHeight - FAB_SIZE - 80 };

function TelegramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function getSavedPos() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      return {
        x: Math.min(Math.max(0, p.x), window.innerWidth  - FAB_SIZE),
        y: Math.min(Math.max(0, p.y), window.innerHeight - FAB_SIZE),
      };
    }
  } catch (_) {}
  return DEFAULT_POS;
}

export function SupportWidget() {
  const [open, setOpen]   = useState(false);
  const [links, setLinks] = useState({ whatsapp: '', telegram: '' });
  const [pos, setPos]     = useState(getSavedPos);
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef(null);
  const dragRef      = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0, moved: false });

  // Load admin links
  useEffect(() => {
    getSettings().then((s) => {
      setLinks({ whatsapp: s.support_whatsapp ?? '', telegram: s.support_telegram ?? '' });
    }).catch(() => {});
  }, []);

  // Close menu on outside click (only when not dragging)
  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  // ── Drag handlers ────────────────────────────────────────────────────────

  const onDragStart = useCallback((clientX, clientY) => {
    dragRef.current = { active: true, startX: clientX, startY: clientY, originX: pos.x, originY: pos.y, moved: false };
    setDragging(true);
  }, [pos]);

  const onDragMove = useCallback((clientX, clientY) => {
    if (!dragRef.current.active) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    const newX = Math.min(Math.max(0, dragRef.current.originX + dx), window.innerWidth  - FAB_SIZE);
    const newY = Math.min(Math.max(0, dragRef.current.originY + dy), window.innerHeight - FAB_SIZE);
    setPos({ x: newX, y: newY });
  }, []);

  const onDragEnd = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    // Persist position
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch (_) {}
  }, [pos]);

  // Mouse events
  useEffect(() => {
    function onMouseMove(e) { onDragMove(e.clientX, e.clientY); }
    function onMouseUp()    { onDragEnd(); }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
  }, [onDragMove, onDragEnd]);

  // Touch events
  useEffect(() => {
    function onTouchMove(e) {
      if (!dragRef.current.active) return;
      e.preventDefault();
      onDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onTouchEnd() { onDragEnd(); }
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend',  onTouchEnd);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend',  onTouchEnd);
    };
  }, [onDragMove, onDragEnd]);

  if (!links.whatsapp && !links.telegram) return null;

  const fabBase = {
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', flexShrink: 0, textDecoration: 'none',
    cursor: dragging ? 'grabbing' : 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  };

  const secondaryStyle = (color, rgba, delay) => ({
    ...fabBase,
    background: color,
    color: '#fff',
    boxShadow: open ? `0 4px 18px ${rgba}` : 'none',
    opacity: open ? 1 : 0,
    transform: open ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(12px)',
    pointerEvents: open ? 'auto' : 'none',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
    transitionDelay: open ? delay : '0s',
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top:  pos.y,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: 8,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* Primary FAB — drag handle */}
      <button
        aria-label={open ? 'Close support menu' : 'Open support menu'}
        aria-expanded={open}
        onMouseDown={(e) => { e.preventDefault(); onDragStart(e.clientX, e.clientY); }}
        onTouchStart={(e) => { onDragStart(e.touches[0].clientX, e.touches[0].clientY); }}
        onClick={() => { if (!dragRef.current.moved) setOpen((v) => !v); }}
        style={{
          ...fabBase,
          background: open ? '#1a1a24' : '#0b0f19',
          border: `1.5px solid ${open ? '#00ff88' : '#2a2a3a'}`,
          color: open ? '#00ff88' : '#8888aa',
          boxShadow: open
            ? '0 0 20px rgba(0,255,136,0.25), 0 4px 16px rgba(0,0,0,0.6)'
            : '0 2px 12px rgba(0,0,0,0.5)',
          transform: 'scale(1)',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      >
        {open ? <X size={18} /> : <Headphones size={18} />}
      </button>

      {/* WhatsApp — renders above FAB via column-reverse */}
      {links.whatsapp && (
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer"
          aria-label="WhatsApp support" onClick={() => setOpen(false)}
          style={secondaryStyle('#25D366', 'rgba(37,211,102,0.45)', '0s')}>
          <WhatsAppIcon size={18} />
        </a>
      )}

      {/* Telegram — renders above WhatsApp via column-reverse */}
      {links.telegram && (
        <a href={links.telegram} target="_blank" rel="noopener noreferrer"
          aria-label="Telegram support" onClick={() => setOpen(false)}
          style={secondaryStyle('#229ED9', 'rgba(34,158,217,0.45)', '0.06s')}>
          <TelegramIcon size={18} />
        </a>
      )}
    </div>
  );
}
