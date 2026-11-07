import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, TrendingUp, Users, Zap, Mail, Phone, Globe } from 'lucide-react';
import { getSettings } from '../../lib/db';
import logo from '../../assets/hmalm01.svg';

export function AboutUs() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setContent({
        about_title:       s.about_title       ?? 'About NEXUS GG',
        about_tagline:     s.about_tagline     ?? 'Interactive Hardware Investment Platform — US · CA · UK · Ghana',
        about_description: s.about_description ?? 'Physical gaming hubs—from high-energy console lounges to competitive esports arenas—run on immediate, daily rental transactions. Every hour, gamers pay cash or tap their cards to play on top-tier consoles. Nexus GG bridges the gap through a high-yield, interactive model: On-Demand Fractional Hardware Deployment. First proven across esports centers in North America and Europe, Nexus GG puts investors directly in control of physical gaming assets, generating automated daily yield payouts whenever consoles are deployed for active play.',
        about_mission:     s.about_mission     ?? 'Ghana\'s gaming and esports community is experiencing exponential growth across Accra, Kumasi, and Takoradi. Nexus GG provides local gaming lounges with state-of-the-art hardware without heavy upfront debt, while opening direct asset-backed investment access to local and international investors. Start acquiring fractional console shares from as low as GHS 150 / $10, and receive daily yields directly into Mobile Money (MTN, Telecel, AT) or local bank accounts.',
        about_email:       s.about_email       ?? '',
        about_phone:       s.about_phone       ?? '',
        about_website:     s.about_website     ?? '',
        about_feat1_title: s.about_feat1_title ?? 'Daily Payouts',
        about_feat1_desc:  s.about_feat1_desc  ?? 'Revenue is routed directly to your wallet every 24 hours — no quarterly or annual waiting.',
        about_feat2_title: s.about_feat2_title ?? 'Physical Asset Backing',
        about_feat2_desc:  s.about_feat2_desc  ?? 'Your investment is backed by real, income-generating hardware — not paper assets or market speculation.',
        about_feat3_title: s.about_feat3_title ?? 'Click-to-Rent Control',
        about_feat3_desc:  s.about_feat3_desc  ?? 'You actively control when your console enters the lounge rental pool to earn daily returns.',
        about_feat4_title: s.about_feat4_title ?? 'Low Entry Barrier',
        about_feat4_desc:  s.about_feat4_desc  ?? 'Start acquiring fractional console shares in PS5s, Xbox, or SIM rigs from as low as GHS 150 / $10.',
      });
      setLoading(false);
    });
  }, []);

  const FEATURES = content ? [
    { icon: TrendingUp, color: '#00d4ff', title: content.about_feat1_title, desc: content.about_feat1_desc },
    { icon: Shield,     color: '#00ff88', title: content.about_feat2_title, desc: content.about_feat2_desc },
    { icon: Users,      color: '#7c3aed', title: content.about_feat3_title, desc: content.about_feat3_desc },
    { icon: Zap,        color: '#ff6b35', title: content.about_feat4_title, desc: content.about_feat4_desc },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-[#2a2a3a] flex items-center justify-center text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <p className="text-base font-black text-[#f0f0ff]">About Us</p>
      </div>

      {/* Hero */}
      <div className="text-center py-4">
        <img src={logo} alt="NEXUS GG" className="w-16 h-16 mx-auto mb-4 invert" />
        <h1 className="text-2xl font-black text-[#f0f0ff] mb-1">{content.about_title}</h1>
        <p className="text-[#00d4ff] text-sm font-semibold">{content.about_tagline}</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide">Who We Are</p>
        <p className="text-sm text-[#c0c0d0] leading-relaxed">{content.about_description}</p>
      </div>

      {/* Mission */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-[#00d4ff] uppercase tracking-wide">Ghana Market Expansion — 2026</p>
        <p className="text-sm text-[#c0c0d0] leading-relaxed">{content.about_mission}</p>
      </div>

      {/* Features */}
      <div>
        <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide mb-3">What We Offer</p>
        <div className="space-y-0 divide-y divide-[#2a2a3a]">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-4 py-4">
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#f0f0ff] mb-0.5">{title}</p>
                <p className="text-xs text-[#8888aa] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      {(content.about_email || content.about_phone || content.about_website) && (
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide">Contact Us</p>
          <div className="space-y-2">
            {content.about_email && (
              <a href={`mailto:${content.about_email}`} className="flex items-center gap-3 text-sm text-[#c0c0d0] hover:text-[#00d4ff] transition-colors">
                <Mail size={15} className="text-[#00d4ff] flex-shrink-0" />
                {content.about_email}
              </a>
            )}
            {content.about_phone && (
              <a href={`tel:${content.about_phone}`} className="flex items-center gap-3 text-sm text-[#c0c0d0] hover:text-[#00d4ff] transition-colors">
                <Phone size={15} className="text-[#00d4ff] flex-shrink-0" />
                {content.about_phone}
              </a>
            )}
            {content.about_website && (
              <a href={content.about_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[#c0c0d0] hover:text-[#00d4ff] transition-colors">
                <Globe size={15} className="text-[#00d4ff] flex-shrink-0" />
                {content.about_website}
              </a>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-[#8888aa] pb-4">© {new Date().getFullYear()} NEXUS GG. All rights reserved.</p>
    </div>
  );
}
