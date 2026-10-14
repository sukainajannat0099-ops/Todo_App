import { useState } from 'react';

// Form for adding a task. Input text and the validation message live in local state.
function TodoForm({ onAddTask }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  // onSubmit event handler
  function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    const validationError = onAddTask(text); // App returns '' on success, or a message
    if (validationError) {
      setError(validationError);
    } else {
      setText('');
      setError('');
    }
  }

  // onChange event handler: clear the error as soon as the user types again
  function handleChange(event) {
    setText(event.target.value);
    if (error) setError('');
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-task" className="visually-hidden">
        New task
      </label>
      <div className="form-row">
        <input
          id="new-task"
          className={`text-input ${error ? 'input-error' : ''}`}
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="What needs to be done?"
          maxLength={120}
          autoComplete="off"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'new-task-error' : undefined}
        />
        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
      </div>
      {error && (
        <p id="new-task-error" className="error-text" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default TodoForm;
