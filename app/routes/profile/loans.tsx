import React, { useState, useEffect } from "react";

interface PageProps {
  title?: string;
}

const BarebonesPage: React.FC<PageProps> = ({ title = "Default Title" }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Component mount effect
    document.title = title;

    // Component cleanup effect
    return () => {
      console.log("Component unmounted");
    };
  }, [title]);

  return (
    <div className="page-container">
      <header>
        <h1>{title}</h1>
      </header>

      <main>
        <section>
          <h2>Content Section</h2>
          <p>This is a barebones React TypeScript page.</p>

          <div className="counter-section">
            <p>Counter: {count}</p>
            <button
              onClick={() => setCount(count + 1)}
              className="counter-button"
            >
              Increment
            </button>
          </div>
        </section>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Your Company</p>
      </footer>
    </div>
  );
};

export default BarebonesPage;
