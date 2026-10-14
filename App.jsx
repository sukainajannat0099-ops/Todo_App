import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Card from './components/Card.jsx';
import TodoForm from './components/TodoForm.jsx';
import TodoFilter from './components/TodoFilter.jsx';
import TodoList from './components/TodoList.jsx';
import Stats from './components/Stats.jsx';
import './App.css';

const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=5';
const STORAGE_KEY = 'todo-app-tasks';
const SEEDED_KEY = 'todo-app-samples-loaded';

// ---------- Helper functions (plain JavaScript, no React) ----------

// Make text comparable: trim, collapse spaces, ignore upper/lower case
function normalize(text) {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Read saved tasks. Runs once, when the app starts.
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((task) => task && typeof task.id === 'string' && typeof task.text === 'string')
      .map((task) => ({ id: task.id, text: task.text, completed: Boolean(task.completed) }));
  } catch {
    return []; // corrupted or blocked storage: start fresh
  }
}

function hasLoadedSamples() {
  try {
    return localStorage.getItem(SEEDED_KEY) === 'true';
  } catch {
    return false;
  }
}

function markSamplesLoaded() {
  try {
    localStorage.setItem(SEEDED_KEY, 'true');
  } catch {
    // ignore storage errors
  }
}

// Add API todos to the existing list WITHOUT overwriting it or creating duplicates.
function mergeSampleTodos(existingTasks, apiTodos) {
  const usedIds = new Set(existingTasks.map((task) => task.id));
  const usedTexts = new Set(existingTasks.map((task) => normalize(task.text)));
  const newTasks = [];

  apiTodos.forEach((todo) => {
    const id = `api-${todo.id}`;
    const text = String(todo.title).trim();
    if (!text || usedIds.has(id) || usedTexts.has(normalize(text))) return; // skip duplicates
    usedIds.add(id);
    usedTexts.add(normalize(text));
    newTasks.push({ id, text, completed: Boolean(todo.completed) });
  });

  return [...existingTasks, ...newTasks];
}

// ---------- Main component ----------

function App() {
  // Lazy initial state: read localStorage once so saved tasks are never overwritten by the API
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(() => !hasLoadedSamples());
  const [fetchError, setFetchError] = useState('');
  const [notice, setNotice] = useState('');
  const [fetchCount, setFetchCount] = useState(0); // changing this re-runs the fetch effect (Retry)

  // useEffect #1: fetch sample todos from the API
  useEffect(() => {
    // On a normal page load, skip the fetch if samples were already loaded before.
    // This stops deleted sample tasks from coming back after a refresh.
    if (fetchCount === 0 && hasLoadedSamples()) return;

    const controller = new AbortController();

    async function loadSampleTodos() {
      setIsLoading(true);
      setFetchError('');
      setNotice('');
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data received from the server');
        }
        // Functional update: always builds on the latest tasks, never replaces them
        setTasks((currentTasks) => mergeSampleTodos(currentTasks, data));
        markSamplesLoaded();
        setNotice('Sample todos loaded. Duplicates were skipped.');
      } catch (error) {
        if (error.name === 'AbortError') return; // effect was cleaned up, ignore
        setFetchError(error.message || 'Something went wrong.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadSampleTodos();

    // Cleanup: cancel the request if the component unmounts or the effect re-runs
    return () => controller.abort();
  }, [fetchCount]);

  // useEffect #2: keep localStorage in sync whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore storage errors (for example private browsing)
    }
  }, [tasks]);

  // Returns an error message, or '' if the text is valid
  function validateTaskText(text, ignoreId = null) {
    const trimmed = text.trim();
    if (!trimmed) return 'Please enter a task before adding it.';
    const isDuplicate = tasks.some(
      (task) => task.id !== ignoreId && normalize(task.text) === normalize(trimmed)
    );
    if (isDuplicate) return 'This task already exists. Please enter a different task.';
    return '';
  }

  function handleAddTask(text) {
    const validationError = validateTaskText(text);
    if (validationError) return validationError;

    const newTask = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: text.trim(),
      completed: false,
    };
    setTasks((currentTasks) => [newTask, ...currentTasks]); // new array, never mutate
    return '';
  }

  function handleEditTask(id, text) {
    const validationError = validateTaskText(text, id);
    if (validationError) return validationError;

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === id ? { ...task, text: text.trim() } : task))
    );
    return '';
  }

  function handleToggleTask(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  }

  function handleDeleteTask(id) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  function handleRetry() {
    setFetchCount((count) => count + 1);
  }

  // Derived values (calculated from state, so they are never out of sync)
  const totalCount = tasks.length;
  const remainingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = totalCount - remainingCount;

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="app">
      <main className="app-container">
        <Header title="My Todo App" subtitle="Plan your day, track your progress, and stay organized." />

        <Card title="Add a new task">
          <TodoForm onAddTask={handleAddTask} />
        </Card>

        <Card>
          <Stats total={totalCount} remaining={remainingCount} completed={completedCount} />
          <TodoFilter currentFilter={filter} onFilterChange={setFilter} />
        </Card>

        <Card title="Your tasks">
          {/* Loading state: ternary + logical AND */}
          {isLoading && (
            <div className="status loading" role="status">
              <span className="spinner" aria-hidden="true"></span>
              <span>Loading sample todos...</span>
            </div>
          )}

          {/* Error state */}
          {fetchError && !isLoading && (
            <div className="status error-box" role="alert">
              <p>Could not load sample todos: {fetchError}. Please check your connection and try again.</p>
              <button type="button" className="btn btn-primary btn-small" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          {/* Success state */}
          {notice && !isLoading && !fetchError && <p className="status success-box">{notice}</p>}

          <TodoList
            tasks={visibleTasks}
            totalCount={totalCount}
            filter={filter}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
          />

          <div className="card-footer">
            <button type="button" className="btn btn-secondary btn-small" onClick={handleRetry} disabled={isLoading}>
              Load sample todos
            </button>
            <span className="hint">Fetches 5 examples and skips any you already have.</span>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default App;
