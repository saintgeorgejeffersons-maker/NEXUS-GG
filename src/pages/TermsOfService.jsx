import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsOfService() {
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
        <p className="text-base font-black text-[#f0f0ff]">Terms of Service</p>
      </div>

      <div className="space-y-6 text-sm text-[#c0c0d0] leading-relaxed">
        <p className="text-xs text-[#8888aa]">Last updated: November 2026</p>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">1. Acceptance of Terms</p>
          <p>By registering for or using the NEXUS GG platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">2. Platform Description</p>
          <p>NEXUS GG is an interactive hardware investment platform that allows users to acquire fractional shares in physical gaming consoles deployed across gaming lounges and esports centers. Users earn daily yields based on actual console rental activity.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">3. Eligibility</p>
          <p>You must be at least 18 years of age to use this platform. By registering, you confirm that you meet this requirement and that all information you provide is accurate and truthful.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">4. Account Registration</p>
          <p>A valid referral code from an existing user is required to register. You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately of any unauthorized use of your account.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">5. Investments and Returns</p>
          <ul className="space-y-1 pl-4">
            <li>All investments are backed by physical gaming hardware assets.</li>
            <li>Daily yield payouts are generated from actual console rental revenue.</li>
            <li>Past performance does not guarantee future returns.</li>
            <li>Investment durations are fixed as stated at the time of purchase.</li>
            <li>Daily earnings must be claimed manually within the platform each day.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">6. Deposits and Withdrawals</p>
          <ul className="space-y-1 pl-4">
            <li>All deposits are processed via Mobile Money (MTN, Telecel, AirtelTigo).</li>
            <li>Minimum deposit and withdrawal amounts apply as configured by the administrator.</li>
            <li>Withdrawal requests are reviewed and processed manually by our team.</li>
            <li>A processing fee may be deducted from withdrawal amounts.</li>
            <li>We reserve the right to request identity verification before processing withdrawals.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">7. Referral Program</p>
          <p>Users may earn commissions by referring others to the platform. Commission rates are set by the platform administrator and may change at any time. Abuse of the referral system, including creating fake accounts, will result in immediate account termination and forfeiture of earnings.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">8. Prohibited Activities</p>
          <p>You agree not to use the platform for any unlawful, fraudulent, or abusive purpose, including but not limited to creating fake accounts, manipulating the referral system, or interfering with other users' access to the platform.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">9. Account Termination</p>
          <p>We reserve the right to suspend or terminate any account found to be in violation of these Terms, without prior notice. Terminated accounts forfeit any pending or unclaimed earnings.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">10. Limitation of Liability</p>
          <p>NEXUS GG shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform, including investment losses resulting from market conditions, hardware failure, or force majeure events beyond our control.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">11. Changes to Terms</p>
          <p>We may update these Terms at any time. Continued use of the platform after any changes constitutes your acceptance of the updated Terms.</p>
        </section>

        <section className="space-y-2">
          <p className="text-base font-bold text-[#f0f0ff]">12. Governing Law</p>
          <p>These Terms are governed by the laws of the Republic of Ghana. Any disputes shall be resolved through negotiation or, if necessary, through the appropriate courts in Ghana.</p>
        </section>

        <p className="text-xs text-[#8888aa] pt-4 border-t border-[#2a2a3a]">© {new Date().getFullYear()} NEXUS GG. All rights reserved.</p>
      </div>
    </div>
  );
}
