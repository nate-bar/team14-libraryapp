import "./resources.css";

export default function Resources() {
  return (
    <div className="resources-container">
      <h1 className="resources-title">Library Resources</h1>
      <p className="resources-intro">
        We provide a wide range of tools and spaces designed to support your
        academic, professional, and personal development.
      </p>

      <div className="resource-list">
        <div className="resource-card">
          <h2>📚 Digital Library</h2>
          <p>
            Instantly access a massive collection of eBooks, academic journals,
            articles, and multimedia resources across various disciplines.
          </p>
          <p>
            Includes access to JSTOR, EBSCOhost, and other academic databases
            with advanced filtering and citation tools.
          </p>
        </div>

        <div className="resource-card">
          <h2>🎧 Audiobooks</h2>
          <p>
            Browse our growing collection of audiobooks, covering fiction,
            non-fiction, and educational topics. Perfect for learning on the go.
          </p>
          <p>
            Available via the library app or directly in your browser.
            Headphones recommended!
          </p>
        </div>

        <div className="resource-card">
          <h2>💻 Computer Access</h2>
          <p>
            Our computer labs are equipped with high-speed internet, Microsoft
            Office, Adobe Suite, coding environments, and more.
          </p>
          <p>
            Printing, scanning, and document conversion stations also available.
          </p>
        </div>

        <div className="resource-card">
          <h2>🧠 Study Rooms</h2>
          <p>
            Reserve private or group study rooms equipped with whiteboards, HDMI
            display screens, and flexible seating.
          </p>
          <p>Book online up to 7 days in advance with your member ID.</p>
        </div>

        <div className="resource-card">
          <h2>🔍 Research Assistance</h2>
          <p>
            Need help with citations, finding sources, or narrowing down a
            topic? Our librarians are here to guide you.
          </p>
          <p>
            Drop-in hours or scheduled 1-on-1 appointments available for
            personalized help.
          </p>
        </div>

        <div className="resource-card">
          <h2>📰 Newspaper & Archive Access</h2>
          <p>
            Explore historical archives and current editions of local and
            national newspapers. Digital scans, microfilm, and searchable PDFs
            available.
          </p>
        </div>

        <div className="resource-card">
          <h2>🌐 Remote Access</h2>
          <p>
            Can’t make it in person? Most of our digital services are accessible
            from home with your login credentials.
          </p>
          <p>Includes digital borrowing, database access, and chat support.</p>
        </div>
      </div>
    </div>
  );
}
