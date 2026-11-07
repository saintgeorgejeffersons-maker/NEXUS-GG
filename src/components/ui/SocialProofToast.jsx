import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ShoppingCart, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

// ── Mock data pool ────────────────────────────────────────────────────────────

const USERNAMES = [
  'Alex_99', 'Kofi_G', 'CyberKnight', 'Viper_GG', 'ProGamer_X',
  'Nana_K', 'Ama_Plays', 'ShadowByte', 'LegendZoro', 'QuickFire_J',
  'Phantom_GH', 'KwesiDrive', 'NeonSlayer', 'Abena_Pro', 'TurboAce',
];

const EVENTS = [
  // purchases — exact products from the catalog
  { type: 'purchased', item: 'PlayStation 5 Pro',    amount: '₵120'   },
  { type: 'purchased', item: 'Xbox Series X Cyber',  amount: '₵250'   },
  { type: 'purchased', item: 'Nintendo Switch OLED', amount: '₵500'   },
  { type: 'purchased', item: 'Steam Deck OLED 1TB',  amount: '₵1,200' },
  { type: 'purchased', item: 'Asus ROG Ally X',      amount: '₵2,700' },
  { type: 'purchased', item: 'PS5 Digital Slim',     amount: '₵7,000' },
  // deposits — realistic amounts
  { type: 'deposited', amount: '₵120'   },
  { type: 'deposited', amount: '₵250'   },
  { type: 'deposited', amount: '₵500'   },
  { type: 'deposited', amount: '₵1,200' },
  { type: 'deposited', amount: '₵2,700' },
  { type: 'deposited', amount: '₵7,000' },
  // withdrawals
  { type: 'withdrew',  amount: '₵80'    },
  { type: 'withdrew',  amount: '₵150'   },
  { type: 'withdrew',  amount: '₵300'   },
  { type: 'withdrew',  amount: '₵600'   },
];

const TIMESTAMPS = [
  'just now', '1 min ago', '2 mins ago', '3 mins ago', '5 mins ago',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildEvent() {
  const ev       = pick(EVENTS);
  const username = pick(USERNAMES);
  const time     = pick(TIMESTAMPS);
  return { id: Date.now() + Math.random(), username, time, ...ev };
}

// Random interval between min and max ms
function randInterval(minSec, maxSec) {
  return (minSec + Math.random() * (maxSec - minSec)) * 1000;
}

// ── Icon helper ───────────────────────────────────────────────────────────────

function EventIcon({ type }) {
  if (type === 'purchased') return <ShoppingCart size={14} className="text-[#00d4ff]" />;
  if (type === 'deposited') return <ArrowDownCircle size={14} className="text-[#00ff88]" />;
  return <ArrowUpCircle size={14} className="text-[#f59e0b]" />;
}

// ── Single toast ──────────────────────────────────────────────────────────────

function Toast({ event, onDismiss }) {
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20); // next tick → triggers CSS transition
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss after 5 s
  useEffect(() => {
    const t = setTimeout(() => handleClose(), 5000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(() => onDismiss(event.id), 350); // wait for fade-out
  }

  const { username, type, item, amount, time } = event;

  const actionLabel =
    type === 'purchased' ? 'purchased' :
    type === 'deposited' ? 'deposited' :
    'withdrew';

  const highlightColor =
    type === 'purchased' ? '#00d4ff' :
    type === 'deposited' ? '#00ff88' :
    '#f59e0b';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        transform:  visible ? 'translateY(0) scale(1)'    : 'translateY(16px) scale(0.96)',
        opacity:    visible ? 1                            : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        background: 'rgba(11, 15, 25, 0.92)',
        border:     `1px solid ${highlightColor}33`,
        boxShadow:  `0 0 18px ${highlightColor}22, 0 4px 24px rgba(0,0,0,0.6)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        width: '100%',
        maxWidth: '300px',
        position: 'relative',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: `${highlightColor}15`,
          border: `1px solid ${highlightColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 1,
        }}
      >
        <EventIcon type={type} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: '#c0c0d0', lineHeight: 1.4, margin: 0 }}>
          <span style={{ fontWeight: 700, color: '#f0f0ff' }}>{username}</span>
          {' '}{actionLabel}{' '}
          {type === 'purchased' ? (
            <>
              <span style={{ fontWeight: 700, color: highlightColor }}>{item}</span>
              {' for '}
              <span style={{ fontWeight: 700, color: highlightColor }}>{amount}</span>
            </>
          ) : (
            <span style={{ fontWeight: 700, color: highlightColor }}>{amount}</span>
          )}
        </p>
        <p style={{ fontSize: 10, color: '#55556a', marginTop: 2 }}>{time}</p>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#55556a', padding: 0, flexShrink: 0, lineHeight: 1,
          marginTop: 1,
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── Container ─────────────────────────────────────────────────────────────────

export function SocialProofToast() {
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef(null);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = randInterval(30, 120);
    timerRef.current = setTimeout(() => {
      setToasts((prev) => {
        // keep at most 3 on screen at once
        const next = [...prev, buildEvent()];
        return next.slice(-3);
      });
      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    // Show first one after a short warm-up (4–8 s) so it doesn't fire instantly on load
    timerRef.current = setTimeout(() => {
      setToasts([buildEvent()]);
      scheduleNext();
    }, randInterval(4, 8));

    return () => clearTimeout(timerRef.current);
  }, [scheduleNext]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Activity notifications"
      style={{
        position: 'fixed',
        bottom: 80,        // above the bottom tab bar
        left: 12,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
        maxWidth: 300,
        width: 'calc(100vw - 24px)',
      }}
    >
      {toasts.map((ev) => (
        <Toast key={ev.id} event={ev} onDismiss={dismiss} />
      ))}
    </div>
  );
}
