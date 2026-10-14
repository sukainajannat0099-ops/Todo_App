import TodoItem from './TodoItem.jsx';

// Shows the visible tasks, or a friendly empty-state message.
function TodoList({ tasks, totalCount, filter, onToggle, onDelete, onEdit }) {
  // Pick the right empty-state message
  let emptyMessage = 'No tasks yet. Add your first task above to get started!';
  if (totalCount > 0 && filter === 'active') emptyMessage = 'No active tasks. Great job, everything is done!';
  if (totalCount > 0 && filter === 'completed') emptyMessage = 'No completed tasks yet. Keep going!';

  return tasks.length === 0 ? (
    <div className="empty-state">
      <p>{emptyMessage}</p>
    </div>
  ) : (
    <ul className="todo-list">
      {/* Dynamic list rendering: .map() with a unique, stable key (task.id) */}
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}

export default TodoList;
