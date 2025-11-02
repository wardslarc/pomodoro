import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogDescription>
          How we handle your data and privacy
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 text-sm leading-relaxed overflow-auto max-h-[60vh]">
        <p className="italic">Effective Date: {new Date().toLocaleDateString()}</p>
        <p>
          Reflective Pomodoro ("we", "our", or "us") operates this application (the
          "Service"). This Privacy Policy explains how we collect, use, and protect
          your information when you use our Service. By using the Service, you
          agree to the collection and use of information in accordance with this
          policy.
        </p>

        <section>
          <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
          <p>We collect several types of information to provide and improve our Service:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials</li>
            <li><strong>Session Data:</strong> We store your Pomodoro session details, including session duration, type, and completion timestamps</li>
            <li><strong>Reflection Content:</strong> Your written reflections and learning insights are stored securely</li>
            <li><strong>Usage Data:</strong> We collect information about how you interact with our Service, including device information, browser type, pages visited, and time spent on features</li>
            <li><strong>Technical Data:</strong> IP addresses, cookies, and similar tracking technologies for security and functionality</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">2. How We Use Your Information</h3>
          <p>Your information is used for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li>To provide, maintain, and improve our Service</li>
            <li>To authenticate your account and secure your data</li>
            <li>To track productivity patterns and generate personalized insights</li>
            <li>To communicate important updates, security alerts, and support messages</li>
            <li>To monitor and analyze usage patterns to enhance user experience</li>
            <li>To detect, prevent, and address technical issues and security vulnerabilities</li>
            <li>To comply with legal obligations and enforce our terms of service</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">3. Data Storage and Security</h3>
          <p>
            We implement appropriate technical and organizational security measures
            to protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. Your data is stored on secure
            servers with encryption and access controls. However, no method of
            transmission over the Internet or electronic storage is 100% secure, and
            we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">4. Data Retention</h3>
          <p>
            We retain your personal information only for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy. We will retain and
            use your information to the extent necessary to comply with our legal
            obligations, resolve disputes, and enforce our policies.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">5. Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to track activity on our
            Service and hold certain information. Cookies are files with small amount
            of data which may include an anonymous unique identifier.
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li><strong>Session Cookies:</strong> Used to operate our Service and maintain your login state</li>
            <li><strong>Preference Cookies:</strong> Used to remember your settings and preferences</li>
            <li><strong>Security Cookies:</strong> Used for security purposes and authentication</li>
            <li><strong>Analytics Cookies:</strong> Used to understand how users interact with our Service</li>
          </ul>
          <p className="mt-2">
            You can instruct your browser to refuse all cookies or to indicate when a
            cookie is being sent. However, if you do not accept cookies, you may not
            be able to use some portions of our Service.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">6. Third-Party Services</h3>
          <p>
            We may employ third-party companies and individuals to facilitate our
            Service ("Service Providers"), provide the Service on our behalf,
            perform Service-related services, or assist us in analyzing how our
            Service is used. These third parties have access to your Personal
            Information only to perform these tasks on our behalf and are obligated
            not to disclose or use it for any other purpose.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">7. Your Data Rights</h3>
          <p>You have the following rights regarding your personal data:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li><strong>Access:</strong> You can request copies of your personal data</li>
            <li><strong>Rectification:</strong> You can request correction of inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> You can request deletion of your personal data</li>
            <li><strong>Restriction:</strong> You can request limitation of processing your data</li>
            <li><strong>Portability:</strong> You can request transfer of your data to another organization</li>
            <li><strong>Objection:</strong> You can object to our processing of your personal data</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">8. International Data Transfers</h3>
          <p>
            Your information may be transferred to — and maintained on — computers
            located outside of your state, province, country, or other governmental
            jurisdiction where the data protection laws may differ from those of
            your jurisdiction. We will take all steps reasonably necessary to ensure
            that your data is treated securely and in accordance with this Privacy
            Policy.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">9. Children's Privacy</h3>
          <p>
            Our Service does not address anyone under the age of 13 ("Children").
            We do not knowingly collect personally identifiable information from
            anyone under the age of 13. If you are a parent or guardian and you are
            aware that your Child has provided us with Personal Data, please
            contact us. If we become aware that we have collected Personal Data from
            children without verification of parental consent, we take steps to
            remove that information from our servers.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">10. Changes to This Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you
            of any changes by posting the new Privacy Policy on this page and
            updating the "Effective Date" at the top. You are advised to review
            this Privacy Policy periodically for any changes. Changes to this
            Privacy Policy are effective when they are posted on this page.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">11. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, your data rights,
            or wish to exercise any of your data protection rights, please contact us at:
          </p>
          <p className="mt-2">
            Email: <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline font-medium">
              reflectivepomodoro.supp@gmail.com
            </a>
          </p>
          <p>
            We will respond to all legitimate requests within 30 days.
          </p>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;