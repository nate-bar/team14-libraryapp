import { useState } from "react";
import "./faq.css";

type Faq = {
  question: string;
  answer: string;
};

const faqs: Faq[] = [
  {
    question: "How do I borrow a book?",
    answer:
      'Log into your account, search for the book, and click the "Borrow" button. If it’s available, it will be reserved for you.',
  },
  {
    question: "What is the loan period?",
    answer:
      "The standard loan period is 14 days. You may renew once for another 14 days if there are no hold requests.",
  },
  {
    question: "Are there late fees?",
    answer:
      "Yes, overdue items incur a $0.50 per day fee. After 30 days, the item is considered lost and you will be charged the replacement cost.",
  },
  {
    question: "Can I place a hold on a book?",
    answer:
      'Yes! If the book is checked out, click "Place Hold" and you’ll be notified when it’s available.',
  },
  {
    question: "How do I contact support?",
    answer:
      "Email support@libraryapp.com or visit the help desk Monday–Friday, 9AM–5PM.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="faq-container">
      <h1 className="faq-title">Frequently Asked Questions</h1>

      {faqs.map((faq, i) => (
        <div
          className={`faq-item ${openIndex === i ? "open" : ""}`}
          key={i}
          onClick={() => toggle(i)}
        >
          <div className="faq-question">
            <span>{faq.question}</span>
            <span className={`arrow ${openIndex === i ? "rotate" : ""}`}>&#9662;</span>
          </div>
          <div className="faq-answer">{faq.answer}</div>
        </div>
      ))}
    </div>
  );
}
