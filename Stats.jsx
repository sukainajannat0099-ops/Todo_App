// Displays the task statistics passed down from App as props.
function Stats({ total, remaining, completed }) {
  return (
    <div className="stats" aria-live="polite">
      <div className="stat">
        <span className="stat-number">{total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat">
        <span className="stat-number">{remaining}</span>
        <span className="stat-label">Remaining</span>
      </div>
      <div className="stat">
        <span className="stat-number">{completed}</span>
        <span className="stat-label">Completed</span>
      </div>
    </div>
  );
}

export default Stats;
