import type { Course } from '@/types';

export const COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Full Stack Web Development',
    description:
      'A comprehensive 120-hour program covering front-end fundamentals, modern JavaScript, React, and back-end APIs with Node.js. Designed to take learners from markup basics to deploying full-stack applications.',
    duration_hours: 120,
    modules: [
      {
        id: 'module-1',
        course_id: 'course-1',
        sequence: 1,
        title: 'HTML & CSS Fundamentals',
        estimated_minutes: 0,
        content_text: `## HTML & CSS Fundamentals

HTML (HyperText Markup Language) provides the structural backbone of every web page, while CSS (Cascading Style Sheets) controls how that structure is presented. Together they form the foundation that every other web technology builds upon. A well-structured HTML document uses semantic elements like \`<header>\`, \`<main>\`, \`<article>\`, and \`<footer>\` to describe meaning, not just appearance.

### The Box Model

Every element on a page is a rectangular box composed of four layers: the **content**, the **padding** around it, the **border** enclosing the padding, and the **margin** that separates the element from its neighbours. Understanding the box model is essential for predictable layouts — a misunderstood margin or an unexpected default padding is the source of countless layout bugs.

### Modern Layout with Flexbox

Flexbox makes it straightforward to distribute space along a single axis. By declaring a flex container you gain powerful alignment controls without floats or positioning hacks:

\`\`\`css
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
\`\`\`

The \`display: flex\` declaration turns the element into a flex container, \`justify-content\` controls alignment along the main axis, and \`align-items\` aligns children along the cross axis. Once you internalise these properties, building responsive, evenly spaced layouts becomes second nature.

### Responsive Design

Media queries let your styles respond to the viewport. Combined with relative units (\`rem\`, \`%\`, \`vw\`) and a mobile-first mindset, they ensure your interface looks intentional on everything from a phone to a wide desktop monitor.`,
      },
      {
        id: 'module-2',
        course_id: 'course-1',
        sequence: 2,
        title: 'JavaScript Core',
        estimated_minutes: 0,
        content_text: `## JavaScript Core

JavaScript is the programming language of the web. It runs in every browser and, thanks to Node.js, on servers too. Mastering its core concepts — scope, closures, the event loop, and asynchronous patterns — is what separates someone who copies snippets from someone who can build reliable applications.

### Functions and Closures

A closure is created when a function "remembers" the variables from the scope in which it was defined, even after that scope has finished executing. Closures power patterns like data privacy and function factories:

\`\`\`javascript
function createCounter() {
  let count = 0;
  return function increment() {
    count += 1;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

The inner \`increment\` function keeps a private reference to \`count\`. Each call mutates and returns that captured variable — a clean way to encapsulate state without a global.

### The 'this' Keyword

In a regular function, \`this\` is determined by **how the function is called**, not where it is defined. Called as a method it refers to the owning object; called standalone it is \`undefined\` in strict mode or the global object otherwise. Arrow functions behave differently — they inherit \`this\` from their enclosing lexical scope.

### Asynchronous JavaScript

Promises and \`async/await\` let you write non-blocking code that reads sequentially. Understanding the event loop — the microtask and macrotask queues — explains why a \`Promise\` callback runs before a \`setTimeout(fn, 0)\` even though both are "asynchronous".`,
      },
      {
        id: 'module-3',
        course_id: 'course-1',
        sequence: 3,
        title: 'React Essentials',
        estimated_minutes: 0,
        content_text: `## React Essentials

React is a declarative library for building user interfaces from composable components. Instead of manually updating the DOM, you describe what the UI should look like for a given state and React efficiently reconciles the differences.

### Components and JSX

Components are functions that return JSX — an XML-like syntax that compiles to function calls. JSX lets you express markup and logic together:

\`\`\`jsx
function Greeting({ name }) {
  return (
    <div className="greeting">
      <h2>Hello, {name}!</h2>
      <p>Welcome back to your dashboard.</p>
    </div>
  );
}
\`\`\`

Props flow **down** from parent to child and are read-only. This one-way data flow makes applications predictable: to understand why something renders, you trace the props and state that produced it.

### State and the useState Hook

State is data that changes over time and triggers re-renders. The \`useState\` hook gives a function component a piece of local state and a setter:

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### Side Effects with useEffect

Not everything fits the render-from-state model — data fetching, subscriptions, and timers are **side effects**. The \`useEffect\` hook runs these after render and lets you clean them up, keeping the render function pure.`,
      },
      {
        id: 'module-4',
        course_id: 'course-1',
        sequence: 4,
        title: 'Node.js & APIs',
        estimated_minutes: 0,
        content_text: `## Node.js & APIs

Node.js lets you run JavaScript outside the browser, making it possible to build servers, command-line tools, and full back-end systems with a single language across the stack. Its event-driven, non-blocking I/O model is well suited to building fast, scalable network applications.

### Building a REST API

REST (Representational State Transfer) is an architectural style that maps HTTP methods to actions on resources: \`GET\` to read, \`POST\` to create, \`PUT\`/\`PATCH\` to update, and \`DELETE\` to remove. A minimal Express server exposing a resource looks like this:

\`\`\`javascript
import express from 'express';

const app = express();
app.use(express.json());

const users = [];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const user = { id: Date.now(), ...req.body };
  users.push(user);
  res.status(201).json(user);
});

app.listen(3000, () => console.log('API running on port 3000'));
\`\`\`

### Status Codes and Error Handling

Returning the correct HTTP status code is part of a good API contract: \`200\` for success, \`201\` for a created resource, \`400\` for a bad request, \`401\` for unauthenticated, \`404\` for not found, and \`500\` for server errors. Consistent error responses make a client developer's life dramatically easier.

### Middleware

Middleware functions sit between the request and the response, ideal for cross-cutting concerns like authentication, logging, and body parsing. They run in order and either pass control onward with \`next()\` or end the request-response cycle.`,
      },
    ],
  },
];

export const COURSE = COURSES[0];

// Compute estimated read time from word count (~200 wpm).
COURSE.modules.forEach((m) => {
  const words = m.content_text.trim().split(/\s+/).length;
  m.estimated_minutes = Math.max(1, Math.round(words / 200));
});

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getModule(moduleId: string) {
  return COURSE.modules.find((m) => m.id === moduleId);
}
