import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TermsAndConditions: React.FC = () => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <DialogDescription>
          Terms of service for using Reflective Pomodoro
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 text-sm leading-relaxed overflow-auto max-h-[60vh]">
        <p className="italic">Last Updated: {new Date().toLocaleDateString()}</p>
        <p>
          Please read these Terms and Conditions carefully before using Reflective
          Pomodoro (the "Service"). By accessing or using the Service, you agree
          to comply with and be bound by these Terms and our Privacy Policy. If
          you do not agree, please discontinue use of the Service.
        </p>

        <section>
          <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
          <p>
            By accessing or using Reflective Pomodoro, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and our Privacy Policy.
            If you are using the Service on behalf of an organization, you represent
            that you have authority to bind that organization to these Terms.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">2. Changes to Terms</h3>
          <p>
            We reserve the right to modify or update these Terms at any time. Any
            changes will be effective immediately upon posting. Continued use of
            the Service after changes are posted constitutes acceptance of the
            revised Terms. We will make reasonable efforts to notify users of
            material changes via email or in-service notifications.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">3. Account Registration and Security</h3>
          <p>
            To access certain features, you must register for an account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and accept all risks of unauthorized access</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Take responsibility for all activities that occur under your account</li>
          </ul>
          <p className="mt-2">
            We reserve the right to disable any user account at our sole discretion,
            including for violation of these Terms or suspicious activity.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">4. Acceptable Use</h3>
          <p>You agree not to use the Service for any unlawful or prohibited purposes, including:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li>Violating any applicable laws, regulations, or third-party rights</li>
            <li>Impersonating any person or entity or falsely stating your affiliation</li>
            <li>Uploading or transmitting viruses, malware, or any destructive code</li>
            <li>Attempting to gain unauthorized access to other accounts or systems</li>
            <li>Interfering with or disrupting the Service or servers/networks connected to the Service</li>
            <li>Using the Service for any commercial purposes without our express written consent</li>
            <li>Engaging in any activity that could damage, disable, overburden, or impair the Service</li>
            <li>Collecting or harvesting any information from the Service</li>
            <li>Using any automated systems, including "robots," "spiders," or "offline readers"</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">5. Intellectual Property Rights</h3>
          <p>
            The Service and its original content, features, and functionality are
            and will remain the exclusive property of Reflective Pomodoro and its
            licensors. The Service is protected by copyright, trademark, and other
            laws of both the United States and foreign countries. Our trademarks
            and trade dress may not be used in connection with any product or
            service without the prior written consent of Reflective Pomodoro.
          </p>
          <p className="mt-2">
            You retain ownership of any content you create, upload, or store within
            the Service. By using the Service, you grant us a worldwide,
            non-exclusive, royalty-free license to use, store, and display your
            content solely for the purpose of providing and improving the Service.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">6. User Content</h3>
          <p>
            You are solely responsible for the content you create and store within
            the Service ("User Content"). You represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li>You own or have the necessary rights to all User Content</li>
            <li>User Content does not infringe any third-party rights</li>
            <li>User Content complies with all applicable laws and regulations</li>
            <li>User Content does not contain harmful, offensive, or illegal material</li>
          </ul>
          <p className="mt-2">
            We reserve the right to remove any User Content that violates these Terms
            or that we determine to be otherwise objectionable.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">7. Service Availability and Modifications</h3>
          <p>
            We strive to maintain the availability of the Service but do not
            guarantee uninterrupted access. We may modify, suspend, or discontinue
            any aspect of the Service at any time, including the availability of
            any feature, database, or content. We may also impose limits on certain
            features and services or restrict your access to parts or all of the
            Service without notice or liability.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">8. Termination</h3>
          <p>
            We may terminate or suspend your account and access to the Service
            immediately, without prior notice or liability, for any reason,
            including if you breach these Terms. Upon termination, your right to
            use the Service will cease immediately. All provisions of these Terms
            which by their nature should survive termination shall survive,
            including ownership provisions, warranty disclaimers, and limitations
            of liability.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">9. Disclaimer of Warranties</h3>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
            OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
            IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
            UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED,
            OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">10. Limitation of Liability</h3>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL REFLECTIVE
            POMODORO, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR
            AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS
            OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING
            FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">11. Indemnification</h3>
          <p>
            You agree to defend, indemnify, and hold harmless Reflective Pomodoro
            and its licensors from and against any claims, damages, obligations,
            losses, liabilities, costs, or debt, and expenses arising from:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
            <li>Your use of and access to the Service</li>
            <li>Your violation of any term of these Terms</li>
            <li>Your violation of any third-party right, including privacy or intellectual property rights</li>
            <li>Any content you post or transmit through the Service</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">12. Governing Law and Jurisdiction</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws
            of the United States, without regard to its conflict of law provisions.
            Any legal suit, action, or proceeding arising out of, or related to,
            these Terms or the Service shall be instituted exclusively in the
            federal courts of the United States or the courts of the state where
            the Service operator is located.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">13. Severability</h3>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable
            by a court, the remaining provisions of these Terms will remain in
            effect. The invalid or unenforceable provision will be deemed modified
            to the minimum extent necessary to make it valid and enforceable.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">14. Entire Agreement</h3>
          <p>
            These Terms constitute the entire agreement between you and Reflective
            Pomodoro regarding our Service and supersede and replace any prior
            agreements we might have had between us regarding the Service.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-2">15. Contact Information</h3>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-2">
            Email: <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline font-medium">
              reflectivepomodoro.supp@gmail.com
            </a>
          </p>
        </section>
      </div>
    </>
  );
};

export default TermsAndConditions;