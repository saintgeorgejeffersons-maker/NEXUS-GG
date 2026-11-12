import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-[#2a2a3a] flex items-center justify-center text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <p className="text-base font-black text-[#f0f0ff]">Privacy Policy</p>
      </div>

      <div className="space-y-6 text-sm text-[#c0c0d0] leading-relaxed">
        <p className="text-xs text-[#8888aa]">Last updated: November 2026</p>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">1. Introduction</p>
          <p>NEXUS GG ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">2. Information We Collect</p>
          <p>We collect information you provide when registering or using our services, including:</p>
          <ul className="space-y-1 pl-4">
            <li>Full name and contact details (phone number, email address)</li>
            <li>Mobile Money account details (network, number, account name)</li>
            <li>Investment activity and transaction history</li>
            <li>Referral relationships</li>
            <li>Device and usage data (IP address, browser type, access times)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">3. How We Use Your Information</p>
          <p>Your information is used to:</p>
          <ul className="space-y-1 pl-4">
            <li>Process investments and facilitate daily yield payouts</li>
            <li>Verify your identity and prevent fraud</li>
            <li>Process deposit and withdrawal requests</li>
            <li>Communicate important account updates</li>
            <li>Improve our platform and services</li>
            <li>Comply with applicable laws and regulations</li>
          </ul>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">4. Data Sharing</p>
          <p>We do not sell your personal data. We may share limited data with trusted third-party service providers (such as payment processors) solely to facilitate our services. All third parties are bound by confidentiality obligations.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">5. Data Security</p>
          <p>We implement industry-standard security measures to protect your data, including encryption and secure access controls. However, no system is completely immune to risks, and we encourage you to use strong passwords and keep your login details confidential.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">6. Data Retention</p>
          <p>We retain your personal data for as long as your account is active or as required by law. You may request deletion of your account and associated data by contacting our support team.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">7. Your Rights</p>
          <p>You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact us through the support channels available on the platform.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">8. Changes to This Policy</p>
          <p>We may update this Privacy Policy periodically. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">9. Contact Us</p>
          <p>For privacy-related questions or concerns, please contact us through the support widget available on the platform.</p>
        </section>

        <p className="text-xs text-[#8888aa] pt-4 border-t border-[#2a2a3a]">© {new Date().getFullYear()} NEXUS GG. All rights reserved.</p>
      </div>
    </div>
  );
}
