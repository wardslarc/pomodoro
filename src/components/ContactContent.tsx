import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ContactContent: React.FC = () => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Contact Us</DialogTitle>
        <DialogDescription>
          Get in touch with our support team
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h3 className="font-semibold text-lg mb-3">Support and General Inquiries</h3>
          <p>We're here to help with any questions, feedback, or issues you may have:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
            <li><strong>Email:</strong> <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline font-medium">reflectivepomodoro.supp@gmail.com</a></li>
            <li><strong>Response Time:</strong> We typically respond within 24-48 hours</li>
            <li><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-3">What to Include in Your Message</h3>
          <p>To help us assist you better, please include:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
            <li>Your username or email associated with your account</li>
            <li>A clear description of your question or issue</li>
            <li>Steps to reproduce any technical issues</li>
            <li>Screenshots if applicable</li>
            <li>Device and browser information</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-3">Types of Inquiries We Handle</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Account and login issues</li>
            <li>Technical support and bug reports</li>
            <li>Feature requests and suggestions</li>
            <li>Privacy and data concerns</li>
            <li>Billing and donation questions</li>
            <li>Partnership opportunities</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-3">Data Protection and Privacy</h3>
          <p>
            When you contact us, we may collect and process your personal information
            to respond to your inquiry. This information is handled in accordance
            with our Privacy Policy. We do not share your contact information with
            third parties without your consent.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-lg mb-3">Feedback and Suggestions</h3>
          <p>
            We welcome your feedback and suggestions for improving Reflective Pomodoro.
            Your input helps us create a better experience for all users. Please
            share any ideas you have for new features or improvements.
          </p>
        </section>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium">
            💡 <strong>Pro Tip:</strong> For faster resolution of technical issues,
            please include your browser version, operating system, and any error
            messages you've encountered.
          </p>
        </div>
      </div>
    </>
  );
};

export default ContactContent;