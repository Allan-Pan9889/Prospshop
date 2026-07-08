import PolicyPage from "@/components/PolicyPage";

export const metadata = { title: "Refund and Cancellation Policy – Prospirete Crest Technologies" };

export default function Page() {
  return (
    <PolicyPage title="Refund and Cancellation Policy">
      <h4>Cancellation</h4>
      <p>
        Orders can be cancelled within 24 hours of placement. Once your order has
        been shipped, cancellation is no longer possible.
      </p>
      <h4>Refunds</h4>
      <p>
        Refunds are processed within 7–10 business days after we receive and
        inspect the returned item. Refunds will be credited to the original
        payment method.
      </p>
      <h4>Non-Refundable Items</h4>
      <ul>
        <li>Items marked as final sale</li>
        <li>Customized or personalized products</li>
        <li>Items returned after 7 days of delivery</li>
      </ul>
    </PolicyPage>
  );
}
