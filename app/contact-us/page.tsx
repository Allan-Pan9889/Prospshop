import PageTitle from "@/components/PageTitle";

export const metadata = {
  title: "Contact us – Tradexel Digitech Private Limited | Woman Fashion Store",
};

export default function ContactPage() {
  return (
    <>
      <PageTitle
        title="Contact us"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact us" }]}
      />
      <div className="content-page">
        <div className="container">
          <div className="contact-grid contact-grid-single">
            <div className="contact-info">
              <h4>Get in Touch</h4>
              <p>
                Have questions about our products, orders, or returns? Reach us
                by email and our team will get back to you as soon as possible.
              </p>
              <div className="contact-details">
                <div className="contact-item">
                  <strong>Company</strong>
                  <p>TRADEXEL DIGITECH PRIVATE LIMITED</p>
                </div>
                <div className="contact-item">
                  <strong>Email</strong>
                  <p>
                    <a href="mailto:support@tradexelh.com">support@tradexelh.com</a>
                  </p>
                </div>
                <div className="contact-item">
                  <strong>Office address</strong>
                  <p>
                    3/180, Mariyammkoil, Muniyappampalayam
                    <br />
                    Sankari, Salem
                    <br />
                    Tamil Nadu - 637301
                  </p>
                </div>
                <div className="contact-item">
                  <strong>Business Hours</strong>
                  <p>Mon – Sat: 9:00 AM – 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
