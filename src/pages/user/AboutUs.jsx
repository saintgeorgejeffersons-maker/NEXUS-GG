import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Shield, TrendingUp, Users, Zap, Mail, Phone, Globe } from 'lucide-react';
import { getSettings } from '../../lib/db';

export function AboutUs() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setContent({
        about_title:       s.about_title       ?? 'About NEXUS GG',
        about_tagline:     s.about_tagline     ?? 'Game. Invest. Earn.',
        about_description: s.about_description ?? 'NEXUS GG is a gaming investment platform that lets you grow your money through daily returns on gaming assets. We combine the excitement of gaming with the power of smart investing.',
        about_mission:     s.about_mission     ?? 'Our mission is to make investing accessible, rewarding, and fun for everyone — starting with the gaming community.',
        about_email:       s.about_email       ?? '',
        about_phone:       s.about_phone       ?? '',
        about_website:     s.about_website     ?? '',
        about_feat1_title: s.about_feat1_title ?? 'Daily Returns',
        about_feat1_desc:  s.about_feat1_desc  ?? 'Earn consistent daily returns on your gaming investments.',
        about_feat2_title: s.about_feat2_title ?? 'Secure Platform',
        about_feat2_desc:  s.about_feat2_desc  ?? 'Your funds and data are protected with industry-standard security.',
        about_feat3_title: s.about_feat3_title ?? 'Referral Rewards',
        about_feat3_desc:  s.about_feat3_desc  ?? 'Invite friends and earn commission on every claim they make.',
        about_feat4_title: s.about_feat4_title ?? 'Growing Community',
        about_feat4_desc:  s.about_feat4_desc  ?? 'Join thousands of gamers already earning on NEXUS GG.',
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
      <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-[#00d4ff]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-[#7c3aed]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 mb-4 mx-auto">
            <Gamepad2 size={30} className="text-[#00d4ff]" />
          </div>
          <h1 className="text-2xl font-black text-[#f0f0ff] mb-1">{content.about_title}</h1>
          <p className="text-[#00d4ff] text-sm font-semibold">{content.about_tagline}</p>
        </div>
      </div>

      {/* Description */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide">Who We Are</p>
        <p className="text-sm text-[#c0c0d0] leading-relaxed">{content.about_description}</p>
      </div>

      {/* Mission */}
      <div className="rounded-2xl p-5 space-y-2" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.08) 100%)', border: '1px solid rgba(0,212,255,0.15)' }}>
        <p className="text-xs font-bold text-[#00d4ff] uppercase tracking-wide">Our Mission</p>
        <p className="text-sm text-[#c0c0d0] leading-relaxed">{content.about_mission}</p>
      </div>

      {/* Features */}
      <div>
        <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide mb-3">What We Offer</p>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="glass-card rounded-2xl p-4 space-y-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-sm font-bold text-[#f0f0ff]">{title}</p>
              <p className="text-xs text-[#8888aa] leading-relaxed">{desc}</p>
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
