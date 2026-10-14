import { useState } from 'react';

// One task row. It has two modes: normal view and edit mode.
function TodoItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editError, setEditError] = useState('');

  function startEditing() {
    setEditText(task.text); // always start from the latest saved text
    setEditError('');
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditError('');
  }

  function handleSave(event) {
    event.preventDefault();
    const validationError = onEdit(task.id, editText);
    if (validationError) {
      setEditError(validationError);
    } else {
      setIsEditing(false);
      setEditError('');
    }
  }

  // Keyboard shortcut: Escape cancels editing
  function handleKeyDown(event) {
    if (event.key === 'Escape') cancelEditing();
  }

  return (
    <li className={`todo-item ${task.completed ? 'completed' : ''}`}>
      {/* Conditional rendering with a ternary: edit mode vs normal mode */}
      {isEditing ? (
        <form className="edit-form" onSubmit={handleSave} noValidate>
          <label htmlFor={`edit-${task.id}`} className="visually-hidden">
            Edit task
          </label>
          <input
            id={`edit-${task.id}`}
            className={`text-input ${editError ? 'input-error' : ''}`}
            type="text"
            value={editText}
            onChange={(event) => {
              setEditText(event.target.value);
              if (editError) setEditError('');
            }}
            onKeyDown={handleKeyDown}
            maxLength={120}
            autoComplete="off"
            autoFocus
          />
          <div className="item-actions">
            <button type="submit" className="btn btn-primary btn-small">
              Save
            </button>
            <button type="button" className="btn btn-secondary btn-small" onClick={cancelEditing}>
              Cancel
            </button>
          </div>
          {editError && (
            <p className="error-text edit-error" role="alert">
              {editError}
            </p>
          )}
        </form>
      ) : (
        <>
          <label className="todo-label">
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
            />
            <span className="todo-text">{task.text}</span>
          </label>
          <div className="item-actions">
            <button type="button" className="btn btn-secondary btn-small" onClick={startEditing}>
              Edit
            </button>
            <button type="button" className="btn btn-danger btn-small" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default TodoItem;
