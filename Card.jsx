// Reusable wrapper that demonstrates the `children` prop.
// Whatever JSX is placed between <Card> ... </Card> is rendered inside it.
function Card({ title, className = '', children }) {
  return (
    <section className={`card ${className}`.trim()}>
      {/* Logical AND (&&): only render the title when one is provided */}
      {title && <h2 className="card-title">{title}</h2>}
      {children}
    </section>
  );
}

export default Card;
