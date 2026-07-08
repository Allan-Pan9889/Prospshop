import PolicyPage from "@/components/PolicyPage";

export const metadata = { title: "Return Policy – Prospirete Crest Technologies" };

export default function Page() {
  return (
    <PolicyPage title="Return Policy">
      <h4>Return Eligibility</h4>
      <p>
        Items may be returned within 7 days of delivery if they are unused,
        unworn, and in their original packaging with all tags attached.
      </p>
      <h4>How to Return</h4>
      <ol>
        <li>Contact us at support@prospshop.com with your order number</li>
        <li>We will provide a return authorization and shipping instructions</li>
        <li>Pack the item securely and ship it to the address provided</li>
      </ol>
      <h4>Return Shipping</h4>
      <p>
        Return shipping costs are the responsibility of the customer unless the
        item received was defective or incorrect.
      </p>
    </PolicyPage>
  );
}
