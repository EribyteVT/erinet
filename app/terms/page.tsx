import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { Separator } from "@/components/ui/separator";

export default function TermsAndConditionsPage() {
  return (
    <PageContainer maxWidth="lg">
      <div className="space-y-6 py-10">
        <SectionHeader
          title="Terms of Service"
          description="Last Updated: April 12, 2025"
        />

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p>
                  Welcome to Eribot. By accessing or using our services, you
                  agree to be bound by these Terms and Conditions. If you do not
                  agree, you may not use our services.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  2. Use of Services
                </h2>
                <p>
                  You agree to use our services only for lawful purposes and in
                  accordance with these Terms. You are solely responsible for
                  any content you create, upload, or share using our services.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  3. Limitation of Liability
                </h2>
                <p>
                  To the fullest extent permitted by law, Eribot and its
                  affiliates, employees, and agents shall not be liable for any
                  direct, indirect, incidental, consequential, or punitive
                  damages arising out of your use of our services. This includes
                  but is not limited to loss of data, revenue, or profits.
                </p>
                <p>
                  Our services are provided "as is" and "as available" without
                  any warranties, express or implied. We do not guarantee that
                  our services will be error-free, 100% secure, or
                  uninterrupted.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  4. User Responsibilities
                </h2>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account credentials and for all activities that occur
                  under your account. You agree to notify us immediately of any
                  unauthorized use of your account.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  5. Third-Party Services
                </h2>
                <p>
                  Our services may integrate with third-party platforms such as
                  Discord and Twitch. We are not responsible for the actions,
                  content, or policies of these third-party services. Your use
                  of third-party services is subject to their respective terms
                  and conditions.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  6. Indemnification
                </h2>
                <p>
                  You agree to indemnify and hold harmless Eribot, its
                  affiliates, employees, and agents from any claims, damages, or
                  expenses arising out of your use of our services or violation
                  of these Terms.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your access to
                  our services at any time, without notice, for any reason,
                  including but not limited to violation of these Terms.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  8. Changes to Terms
                </h2>
                <p>
                  We reserve the right to update these Terms and Conditions at
                  any time. We will notify you of significant changes, but it is
                  your responsibility to review these Terms periodically.
                </p>
              </section>

              <Separator className="my-6" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                <p>
                  If you have any questions or concerns about these Terms,
                  please contact us at:
                </p>
                <p className="mt-4 font-medium">
                  Email: eribotstream@gmail.com
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
