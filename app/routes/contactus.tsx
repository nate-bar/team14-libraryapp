import "../routes/contactus.css";
export default function contactus() {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>
        Have questions? We're here to help! Reach out to us through the
        following methods:
      </p>

      <div className="contact-info">
        <h2>Address</h2>
        <p>
          <strong>Library HQ</strong>
        </p>
        <p>123 Library Lane, Houston, TX 77001</p>

        <h2>Email</h2>
        <p>
          <strong>support@libraryapp.com</strong>
        </p>

        <h2>Phone</h2>
        <p>
          <strong>(123) 456-7890</strong>
        </p>

        <h2>Hours of Operation</h2>
        <p>
          <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM
        </p>
        <p>
          <strong>Saturday:</strong> 10:00 AM - 4:00 PM
        </p>
        <p>
          <strong>Sunday:</strong> Closed
        </p>
      </div>
    </div>
  );
}
