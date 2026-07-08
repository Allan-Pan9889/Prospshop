import PolicyPage from "@/components/PolicyPage";

export const metadata = { title: "Privacy Policy – Prospirete Crest Technologies" };

export default function Page() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        Prospirete Crest Technologies Private Limited (&quot;we&quot;, &quot;our&quot;, or
        &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, and safeguard your personal information when
        you visit our website prospshop.com.
      </p>
      <h4>Information We Collect</h4>
      <p>
        We may collect personal information such as your name, email address,
        phone number, shipping address, and payment details when you place an
        order or create an account.
      </p>
      <h4>How We Use Your Information</h4>
      <ul>
        <li>To process and fulfill your orders</li>
        <li>To communicate with you about your orders and account</li>
        <li>To improve our website and services</li>
        <li>To send promotional communications (with your consent)</li>
      </ul>
      <h4>Data Security</h4>
      <p>
        We implement appropriate security measures to protect your personal
        information against unauthorized access, alteration, or disclosure.
      </p>
      <h4>Contact Us</h4>
      <p>
        If you have questions about this Privacy Policy, please contact us at
        support@prospshop.com.
      </p>
    </PolicyPage>
  );
}
