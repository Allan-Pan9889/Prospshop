import PolicyPage from "@/components/PolicyPage";

export const metadata = { title: "Shipping Policy – Prospirete Crest Technologies" };

export default function Page() {
  return (
    <PolicyPage title="Shipping Policy">
      <h4>Shipping Areas</h4>
      <p>We currently ship to all locations within India.</p>
      <h4>Processing Time</h4>
      <p>
        Orders are typically processed within 1–2 business days. You will receive
        a confirmation email with tracking information once your order ships.
      </p>
      <h4>Delivery Time</h4>
      <p>
        Standard delivery takes 5–7 business days. Delivery times may vary for
        remote locations.
      </p>
      <h4>Shipping Charges</h4>
      <p>
        Shipping charges are calculated at checkout based on your location and
        order weight. Free shipping may be available on orders above a certain
        value.
      </p>
    </PolicyPage>
  );
}
