import type { Metadata } from "next";

import { LegalPage } from "@/components/site/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that apply to using ${siteConfig.name}'s website.`,
  alternates: { canonical: "/terms-of-service" },
  robots: { index: true, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" updated="August 2026">
      <section>
        <h2>What this website is</h2>
        <p>
          This website is an information and enquiry service run by{" "}
          {siteConfig.legalName}. It describes our destinations, packages,
          stays, and travel services, and lets you start a conversation with
          us about them. It is <strong>not</strong> a booking or payment
          platform — nothing you do on this site creates a confirmed
          reservation or a financial transaction.
        </p>
      </section>

      <section>
        <h2>How a trip is actually confirmed</h2>
        <p>
          Every price shown on this site (for a package, a room, or a service)
          is a starting estimate. A booking is only confirmed once you have
          agreed final dates, inclusions, and price with our team directly —
          by WhatsApp, phone, or email — and any deposit or payment we ask for
          has been received. We will always confirm the details with you in
          writing (a message or email) before treating a trip as booked.
        </p>
      </section>

      <section>
        <h2>Reviews you submit</h2>
        <p>
          By submitting a review, you confirm it reflects your own genuine
          experience and you give us permission to publish it on this site
          (with your display name, but never your email). We may edit a
          review for length or clarity, and may decline to publish a review
          that is abusive, fraudulent, or unrelated to a real trip with us.
        </p>
      </section>

      <section>
        <h2>Content and accuracy</h2>
        <p>
          We take care to keep destination, package, and pricing information
          accurate and current, but conditions in the field — weather,
          permits, availability — can change quickly in the Himalayas. Treat
          everything on this site as a starting point for a conversation, not
          a guarantee, until we confirm it with you directly.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, {siteConfig.legalName} is not liable
          for indirect or consequential loss arising from your use of this
          website. This does not limit any liability we hold under the terms
          you separately agree to when a trip is actually confirmed.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of India, with the courts of
          West Bengal having jurisdiction over any dispute.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-teal-deep underline">
            {siteConfig.email}
          </a>{" "}
          or {siteConfig.phoneDisplay}.
        </p>
      </section>
    </LegalPage>
  );
}
