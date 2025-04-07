import "./contactus.css";

export default function ContactUs() {
  return (
    <div className="contact-container">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-intro">
        Have questions? We're here to help. Reach out to us through any of the
        methods below.
      </p>

      <div className="contact-grid">
        <div className="contact-section">
          <h2>📍 Address</h2>
          <p>
            <strong>Library HQ</strong>
          </p>
          <p>123 Library Lane</p>
          <p>Houston, TX 77001</p>
        </div>

        <div className="contact-section">
          <h2>📧 Email</h2>
          <p>
            <strong>support@libraryapp.com</strong>
          </p>
        </div>

        <div className="contact-section">
          <h2>📞 Phone</h2>
          <p>
            <strong>(123) 456-7890</strong>
          </p>
        </div>

        <div className="contact-section">
          <h2>⏰ Hours of Operation</h2>
          <p>
            <strong>Monday – Friday:</strong> 9:00 AM – 6:00 PM
          </p>
          <p>
            <strong>Saturday:</strong> 10:00 AM – 4:00 PM
          </p>
          <p>
            <strong>Sunday:</strong> Closed
          </p>
        </div>
      </div>
    </div>
  );
}
