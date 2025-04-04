import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <PageContainer maxWidth="lg">
      <div className="space-y-6 py-10">
        <SectionHeader
          title="Privacy Policy"
          description="Last Updated: April 4, 2025"
        />

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p>
                  Welcome to Eribot. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when
                  you use our service. We respect your privacy and are committed
                  to protecting your personal data.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  2.1 Account Information
                </h3>
                <p>
                  When you connect with Discord, we collect the following
                  information:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Discord user ID</li>
                  <li>Username</li>
                  <li>Email address</li>
                  <li>Avatar image</li>
                  <li>Access tokens for authentication</li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  2.2 Guild and Stream Information
                </h3>
                <p>
                  We collect information about Discord servers (guilds) you
                  manage, including:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Guild IDs</li>
                  <li>Guild names</li>
                  <li>Guild icons</li>
                  <li>Stream schedules</li>
                  <li>Streamer information</li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  2.3 Twitch Integration
                </h3>
                <p>If you connect a Twitch account, we collect:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Twitch user ID</li>
                  <li>Twitch username</li>
                  <li>Broadcast ID</li>
                  <li>Profile information</li>
                  <li>Access and refresh tokens</li>
                </ul>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  3. How We Use Your Information
                </h2>
                <p>We use your information to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Create and manage your account</li>
                  <li>Provide stream scheduling services</li>
                  <li>Facilitate connections between Discord and Twitch</li>
                  <li>Create Discord events and Twitch schedule segments</li>
                  <li>Enable website generation features</li>
                </ul>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  4. Data Storage and Security
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  4.1 Storage Methods
                </h3>
                <p>Your data is stored in our PostgreSQL database.</p>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  4.2 What we Store
                </h3>
                <p>We store the following about you and your accounts:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Encrypted twitch access and refresh tokens</li>
                  <li>Your name on twitch</li>
                  <li>The id of any Discord servers Eribot is enabled in</li>
                  <li>Your timezone</li>
                  <li>Any Discord channel or role id's you give us </li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  4.3 Security Measures
                </h3>
                <p>We implement appropriate security measures including:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Encryption of sensitive tokens using AES-256-GCM</li>
                  <li>Secure storage of refresh tokens</li>
                  <li>HTTPS for all data transmissions</li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  4.4 Data Retention
                </h3>
                <p>
                  We retain your data for as long as your account is active. You
                  may request deletion of your data at any time.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  5. Third-Party Services
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  5.1 Discord Integration
                </h3>
                <p>We use Discord's API to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Authenticate users</li>
                  <li>Access guild information</li>
                  <li>Create and manage scheduled events</li>
                  <li>Maintain authorization through OAuth2</li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  5.2 Twitch Integration
                </h3>
                <p>We use Twitch's API to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Connect streamer accounts</li>
                  <li>Create and manage schedule segments</li>
                  <li>Retrieve user profile information</li>
                  <li>Maintain authorization through OAuth2</li>
                </ul>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  6. Website Generator Feature
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  6.1 Local Processing
                </h3>
                <p>The website generator feature:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Processes data entirely within your browser</li>
                  <li>Does not store generated website files on our servers</li>
                  <li>
                    Creates downloadable files delivered directly to your device
                  </li>
                  <li>
                    Uses your provided Discord and stream data to create
                    customized website files
                  </li>
                </ul>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  7. Cookies and Session Management
                </h2>
                <p>We use session cookies to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Authenticate your identity</li>
                  <li>Maintain your login session</li>
                  <li>Ensure secure connections</li>
                  <li>Store user preferences</li>
                </ul>
                <p className="mt-4">
                  These cookies do not track your activities on other websites.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Revoke platform connections at any time</li>
                  <li>Object to certain processing of your data</li>
                  <li>Export your data in a portable format</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us using the
                  information in Section 12.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  9. Children's Privacy
                </h2>
                <p>
                  Our service is not intended for use by individuals under the
                  age of 13. We do not knowingly collect personal information
                  from children under 13.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  10. Changes to This Privacy Policy
                </h2>
                <p>
                  We encourage you to review this Privacy Policy periodically,
                  as it may be changed or updated from time to time. We will
                  make an effort to notify you of such changes, but will not be
                  liable for failure to do so. Your continued use of Eribot and
                  its associated services after any change in the Privacy Policy
                  will constitute your acknowledgement and acceptance of such
                  changes.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  11. Legal Basis for Processing
                </h2>
                <p>We process your data based on:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Consent you provide when connecting your accounts</li>
                  <li>Necessity to perform services you request</li>
                  <li>
                    Legitimate interests in providing and improving our service
                  </li>
                </ul>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                <p>
                  If you have questions or concerns about this Privacy Policy or
                  our data practices, please contact us at:
                </p>
                <p className="mt-4 font-medium">
                  Email: eribotstream@gmail.com
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  13. International Data Transfers
                </h2>
                <p>
                  Your data may be transferred to and processed in countries
                  outside your country of residence. We ensure appropriate
                  safeguards are in place to protect your information in
                  compliance with applicable laws.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  14. Acceptance of Terms
                </h2>
                <p>
                  By using Erinet, you confirm that you have read and understood
                  this Privacy Policy and agree to its terms.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
