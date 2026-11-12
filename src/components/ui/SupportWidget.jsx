import { useState, useEffect, useRef, useCallback } from 'react';
import { Headphones, X } from 'lucide-react';
import { getSettings } from '../../lib/db';

const STORAGE_KEY = 'nexusgg_support_widget_pos';
const FAB_SIZE = 44;
const TAB_BAR  = 64;   // tab bar height — widget never goes below this
const HEADER   = 56;   // header height — widget never goes above this
const PADDING  = 8;    // gap from edges

// pos stores { side: 'left'|'right', bottom: number }
// "bottom" is distance from top of tab bar upward (i.e. visual distance above tab bar)

function getAppWidth() { return Math.min(448, window.innerWidth); }

function clampBottom(bottom) {
  const maxBottom = window.innerHeight - HEADER - TAB_BAR - FAB_SIZE;
  return Math.min(Math.max(PADDING, bottom), maxBottom);
}

function getSavedPos() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      if (p.side && typeof p.bottom === 'number') {
        return { side: p.side, bottom: clampBottom(p.bottom) };
      }
    }
  } catch (_) {}
  return { side: 'right', bottom: PADDING };
}

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

export function SupportWidget() {
  const [open, setOpen]     = useState(false);
  const [links, setLinks]   = useState({ whatsapp: '', telegram: '' });
  const [pos, setPos]       = useState(getSavedPos);
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef(null);
  // track drag in a ref to avoid stale closure issues
  const dragRef = useRef({
    active: false, moved: false,
    startY: 0, startBottom: 0,   // y axis
    startX: 0,                   // x axis (for snap decision)
  });

  useEffect(() => {
    getSettings().then((s) => {
      setLinks({ whatsapp: s.support_whatsapp ?? '', telegram: s.support_telegram ?? '' });
    }).catch(() => {});
  }, []);

  // close on outside tap
  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  // ── drag ──────────────────────────────────────────────────────────────────

  const startDrag = useCallback((clientX, clientY) => {
    dragRef.current = {
      active: true, moved: false,
      startX: clientX, startY: clientY,
      startBottom: pos.bottom,
    };
    setDragging(true);
  }, [pos.bottom]);

  const moveDrag = useCallback((clientX, clientY) => {
    if (!dragRef.current.active) return;
    const dy = dragRef.current.startY - clientY; // inverted: drag up = more bottom
    const dx = clientX - dragRef.current.startX;
    if (Math.abs(dy) > 3 || Math.abs(dx) > 3) dragRef.current.moved = true;
    const newBottom = clampBottom(dragRef.current.startBottom + dy);
    setPos((p) => ({ ...p, bottom: newBottom }));
  }, []);

  const endDrag = useCallback((clientX) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);

    // snap to left or right based on release x relative to app center
    const appWidth  = getAppWidth();
    const appLeft   = (window.innerWidth - appWidth) / 2;
    const appCenter = appLeft + appWidth / 2;
    const side      = clientX < appCenter ? 'left' : 'right';

    setPos((p) => {
      const snapped = { side, bottom: p.bottom };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapped)); } catch (_) {}
      return snapped;
    });
  }, []);

  // mouse
  useEffect(() => {
    function onMove(e) { moveDrag(e.clientX, e.clientY); }
    function onUp(e)   { endDrag(e.clientX); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [moveDrag, endDrag]);

  // touch
  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current.active) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onEnd(e) { endDrag(e.changedTouches[0].clientX); }
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend',  onEnd);
    return () => { document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
  }, [moveDrag, endDrag]);

  if (!links.whatsapp && !links.telegram) return null;

  // Convert side + bottom into CSS fixed position
  const appWidth = getAppWidth();
  const appLeft  = (window.innerWidth - appWidth) / 2;
  const xPos     = pos.side === 'left'
    ? appLeft + PADDING
    : appLeft + appWidth - FAB_SIZE - PADDING;

  const fabBase = {
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', flexShrink: 0, textDecoration: 'none',
  };

  const secondaryStyle = (color, rgba, delay) => ({
    ...fabBase,
    background: color, color: '#fff',
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
        left:   xPos,
        // bottom offset from the tab bar top, not from viewport bottom
        bottom: TAB_BAR + pos.bottom,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: 8,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* Primary FAB */}
      <div style={{ position: 'relative', width: FAB_SIZE, height: FAB_SIZE }}>
        {/* Pulsing ring — only when closed */}
        {!open && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(0,255,136,0.5)',
            animation: 'nexus-pulse 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
        <button
          aria-label={open ? 'Close support menu' : 'Open support menu'}
          aria-expanded={open}
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onTouchStart={(e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
          onClick={() => { if (!dragRef.current.moved) setOpen((v) => !v); }}
          style={{
            ...fabBase,
            width: FAB_SIZE, height: FAB_SIZE,
            background: open ? '#1a1a24' : '#0b0f19',
            border: `2px solid ${open ? '#00ff88' : '#00ff88'}`,
            color: open ? '#00ff88' : '#00ff88',
            boxShadow: open
              ? '0 0 20px rgba(0,255,136,0.35), 0 4px 16px rgba(0,0,0,0.6)'
              : '0 0 14px rgba(0,255,136,0.4), 0 2px 12px rgba(0,0,0,0.5)',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
        >
          {open ? <X size={18} /> : <Headphones size={18} />}
        </button>
      </div>

      {/* WhatsApp */}
      {links.whatsapp && (
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer"
          aria-label="WhatsApp support" onClick={() => setOpen(false)}
          style={secondaryStyle('#25D366', 'rgba(37,211,102,0.45)', '0s')}>
          <WhatsAppIcon size={18} />
        </a>
      )}

      {/* Telegram */}
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
