import "./about.css";

export default function AboutPage() {
  return (
    <div className="about-container">
      <section className="hero">
        <h1>Welcome to Our Library</h1>
        <p className="tagline">
          Empowering learning, discovery, and imagination—one book at a time.
        </p>
      </section>

      <section className="mission">
        <h2>Our Mission</h2>
        <p>
          We aim to deliver a modern, accessible, and dynamic platform for book
          lovers, students, and lifelong learners. Whether you're seeking
          research material or your next favorite novel, our collection and
          tools are here for you.
        </p>
      </section>

      <section className="vision">
        <h2>Our Vision</h2>
        <p>
          To become a leading digital hub of knowledge and creativity by
          blending physical collections with technology-driven resources that
          adapt to every reader's journey.
        </p>
      </section>

      <section className="team">
        <h2>Meet the Team</h2>
        <ul className="ul1">
          <li>
            <strong>Ling Wang</strong> – Developer
          </li>
          <li>
            <strong>Nathan Barchie</strong> – Developer
          </li>
          <li>
            <strong>John </strong> – Developer
          </li>
          <li>
            <strong>Daniel </strong> – Developer
          </li>
          <li>
            <strong>Diana </strong> – Developer
          </li>
        </ul>
      </section>

      <section className="connect">
        <h2>Stay Connected</h2>
        <p>
          Follow us for updates on new arrivals, featured books, and campus
          events. Have questions or feedback? Reach out through our contact
          page!
        </p>
      </section>
    </div>
  );
}
