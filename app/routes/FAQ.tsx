import "./faq.css";

export default function FaqPage() {
  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-item">
        <h2> How do I borrow a book?</h2>
        <p>
          You can borrow a book by logging into your account, searching for the book, 
          and clicking the "Borrow" button.
        </p>
      </div>

      <div className="faq-item">
        <h2> What is the loan period?</h2>
        <p>
          The standard loan period is <b>14 days</b>. You may renew the book once if no one else 
          has requested it.
        </p>
      </div>

      <div className="faq-item">
        <h2> Are there late fees?</h2>
        <p>
          Yes, a late fee of <b>$0.50</b> per day is applied for overdue books. 
          Please return your books on time to avoid charges.
        </p>
      </div>

      <div className="faq-item">
        <h2> How do I contact support?</h2>
        <p>
          You can reach out to us at <b>support@libraryapp.com</b> or visit 
          the help desk at our main branch.
        </p>
      </div>
    </div>
  );
}
