import "./FilterPanel.css";

function FilterPanel({ filters, onToggle, onReset, layout, onLayoutChange }) {
  const items = [
    { key: "showFriends", label: "Show Friends" },
    { key: "showMutual", label: "Show Mutual Friends" },
    { key: "showCommunities", label: "Show Communities" },
  ];

  return (
    <div className="filter-panel card">
      <h3 className="filter-panel-title">Layout</h3>
      <select className="input" value={layout} onChange={(e) => onLayoutChange(e.target.value)}>
        <option value="force">Force Directed</option>
        <option value="circular">Circular</option>
      </select>

      <h3 className="filter-panel-title" style={{ marginTop: 22 }}>Filters</h3>
      <div className="filter-panel-checks">
        {items.map((item) => (
          <label key={item.key} className="filter-check">
            <input
              type="checkbox"
              checked={filters[item.key]}
              onChange={() => onToggle(item.key)}
            />
            {item.label}
          </label>
        ))}
      </div>

      <button className="btn btn-primary" style={{ width: "100%", marginTop: 22 }} onClick={onReset}>
        Reset View
      </button>
    </div>
  );
}

export default FilterPanel;
