import type { Metadata } from "next";

import { LegalPage } from "@/components/site/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.legalName} collects, uses and protects your information.`,
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 2026">
      <section>
        <h2>What this site does not do</h2>
        <p>
          {siteConfig.name} does not process payments, and does not require an
          account to browse, book, or make an enquiry. Every &ldquo;Book&rdquo;
          or &ldquo;Enquire&rdquo; action on this site opens WhatsApp — the
          conversation, and any payment, happens there directly with our team,
          not through this website.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <p>We collect information only when you choose to give it to us:</p>
        <ul>
          <li>
            <strong>Review submissions</strong> — your name, an optional email
            address, and the review text you write. Your email is never shown
            publicly and is used only if we need to verify a submission.
          </li>
          <li>
            <strong>WhatsApp, phone, or email contact</strong> — anything you
            share in that conversation is governed by WhatsApp&rsquo;s own
            privacy policy and our normal business record-keeping, not by this
            website.
          </li>
          <li>
            <strong>Basic technical logs</strong> kept by our hosting provider
            (Vercel) and content delivery network for security and reliability
            — standard server logs, not a tracking or advertising profile.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          Review submissions are read by our team before publishing, to keep
          the reviews on this site genuine. We do not sell, rent, or share
          your information with third parties for marketing purposes.
        </p>
      </section>

      <section>
        <h2>Where it&rsquo;s stored</h2>
        <p>
          Review data is stored with MongoDB Atlas; photos are stored with
          Cloudinary. Both are reputable infrastructure providers used purely
          to run this website — neither has an independent relationship with
          you.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          This site sets one cookie: a session cookie for our internal admin
          panel, which does not apply to regular visitors. We do not use
          advertising or third-party tracking cookies.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask us to remove a review you submitted, or any personal
          data we hold about you, at any time — email{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-teal-deep underline">
            {siteConfig.email}
          </a>{" "}
          and we will act on it promptly.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          Reach us at{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-teal-deep underline">
            {siteConfig.email}
          </a>{" "}
          or {siteConfig.phoneDisplay}.
        </p>
      </section>
    </LegalPage>
  );
}
