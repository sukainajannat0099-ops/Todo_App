// The three filter options. Defined outside the component so it isn't recreated on each render.
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function TodoFilter({ currentFilter, onFilterChange }) {
  return (
    <div className="filter" role="group" aria-label="Filter tasks">
      {FILTERS.map((filter) => (
        <button
          key={filter.key}
          type="button"
          className={`filter-btn ${currentFilter === filter.key ? 'active' : ''}`}
          aria-pressed={currentFilter === filter.key}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default TodoFilter;
