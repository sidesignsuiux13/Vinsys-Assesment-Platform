import type { MCQQuestion, CodingQuestion } from '@/types';

export const MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: 'q-mcq-1',
    type: 'mcq',
    question_text: 'Which CSS property is used to create a flex container?',
    options: ['display: flex', 'position: flex', 'flex-direction: row', 'box: flex'],
    correct_answer: 0,
    difficulty: 'easy',
    marks: 1,
    module_id: 'module-1',
    course_id: 'course-1',
    explanation:
      'Setting `display: flex` on an element turns it into a flex container, enabling flexbox layout for its children.',
  },
  {
    id: 'q-mcq-2',
    type: 'mcq',
    question_text: 'Which HTML tag is used to define the largest heading?',
    options: ['<head>', '<h6>', '<h1>', '<heading>'],
    correct_answer: 2,
    difficulty: 'easy',
    marks: 1,
    module_id: 'module-1',
    course_id: 'course-1',
    explanation: '`<h1>` represents the highest-level (largest) heading; `<h6>` is the smallest.',
  },
  {
    id: 'q-mcq-3',
    type: 'mcq',
    question_text: 'In the CSS box model, which layer sits directly outside the border?',
    options: ['Padding', 'Margin', 'Content', 'Outline'],
    correct_answer: 1,
    difficulty: 'medium',
    marks: 2,
    module_id: 'module-1',
    course_id: 'course-1',
    explanation: 'Order from inside out is content → padding → border → margin, so margin sits outside the border.',
  },
  {
    id: 'q-mcq-4',
    type: 'mcq',
    question_text: "What does the 'this' keyword refer to in a regular (non-arrow) function called standalone in strict mode?",
    options: ['The global object', 'undefined', 'The function itself', 'The window object'],
    correct_answer: 1,
    difficulty: 'hard',
    marks: 4,
    module_id: 'module-2',
    course_id: 'course-1',
    explanation: "In strict mode, a standalone function call leaves `this` as `undefined` rather than the global object.",
  },
  {
    id: 'q-mcq-5',
    type: 'mcq',
    question_text: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
    options: ['var', 'let', 'const', 'static'],
    correct_answer: 2,
    difficulty: 'easy',
    marks: 1,
    module_id: 'module-2',
    course_id: 'course-1',
    explanation: '`const` declares a block-scoped binding that cannot be reassigned after initialization.',
  },
  {
    id: 'q-mcq-6',
    type: 'mcq',
    question_text: 'What is the output of: console.log(typeof null) ?',
    options: ["'null'", "'object'", "'undefined'", "'number'"],
    correct_answer: 1,
    difficulty: 'medium',
    marks: 2,
    module_id: 'module-2',
    course_id: 'course-1',
    explanation: "`typeof null` returns 'object' — a long-standing quirk of JavaScript.",
  },
  {
    id: 'q-mcq-7',
    type: 'mcq',
    question_text: 'Which React hook is used to perform side effects in a function component?',
    options: ['useState', 'useEffect', 'useMemo', 'useRef'],
    correct_answer: 1,
    difficulty: 'easy',
    marks: 1,
    module_id: 'module-3',
    course_id: 'course-1',
    explanation: '`useEffect` runs side effects (data fetching, subscriptions, timers) after render.',
  },
  {
    id: 'q-mcq-8',
    type: 'mcq',
    question_text: 'In React, how does data flow between a parent and child component by default?',
    options: [
      'Two-way binding',
      'Bottom-up via refs',
      'Top-down via props (one-way)',
      'Through global variables',
    ],
    correct_answer: 2,
    difficulty: 'medium',
    marks: 2,
    module_id: 'module-3',
    course_id: 'course-1',
    explanation: 'React uses one-way data flow: props pass data top-down from parent to child and are read-only.',
  },
  {
    id: 'q-mcq-9',
    type: 'mcq',
    question_text: 'What is the default HTTP method used when an HTML form is submitted without specifying one?',
    options: ['POST', 'PUT', 'GET', 'PATCH'],
    correct_answer: 2,
    difficulty: 'medium',
    marks: 2,
    module_id: 'module-4',
    course_id: 'course-1',
    explanation: "If no `method` attribute is set, an HTML form defaults to the GET method.",
  },
  {
    id: 'q-mcq-10',
    type: 'mcq',
    question_text: 'Which HTTP status code indicates that a new resource was successfully created?',
    options: ['200 OK', '201 Created', '204 No Content', '404 Not Found'],
    correct_answer: 1,
    difficulty: 'hard',
    marks: 4,
    module_id: 'module-4',
    course_id: 'course-1',
    explanation: '`201 Created` signals that the request succeeded and a new resource was created as a result.',
  },
];

export const CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: 'q-code-1',
    type: 'coding',
    question_text:
      'Write a function `reverseString` that takes a string and returns it reversed, **without** using the built-in `reverse()` method. For example, given `"hello"` it should return `"olleh"`.',
    difficulty: 'medium',
    marks: 10,
    module_id: 'module-2',
    course_id: 'course-1',
    starter_code: {
      javascript: `function reverseString(str) {
  // Your code here
  return str;
}

console.log(reverseString("hello"));`,
      python: `def reverse_string(s):
    # Your code here
    return s

print(reverse_string("hello"))`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string reverseString(string str) {
    // Your code here
    return str;
}

int main() {
    cout << reverseString("hello") << endl;
    return 0;
}`,
    },
    sample_input: 'hello',
    sample_output: 'olleh',
    hidden_test_cases: 3,
  },
  {
    id: 'q-code-2',
    type: 'coding',
    question_text:
      'Write a function `isPrime` that takes an integer `n` and returns `true` if it is a prime number and `false` otherwise. A prime number is greater than 1 and divisible only by 1 and itself. For example, `7` returns `true` and `9` returns `false`.',
    difficulty: 'medium',
    marks: 10,
    module_id: 'module-2',
    course_id: 'course-1',
    starter_code: {
      javascript: `function isPrime(n) {
  // Your code here
  return false;
}

console.log(isPrime(7));`,
      python: `def is_prime(n):
    # Your code here
    return False

print(is_prime(7))`,
      cpp: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    // Your code here
    return false;
}

int main() {
    cout << boolalpha << isPrime(7) << endl;
    return 0;
}`,
    },
    sample_input: '7',
    sample_output: 'true',
    hidden_test_cases: 3,
  },
];

export const ALL_QUESTIONS = [...MCQ_QUESTIONS, ...CODING_QUESTIONS];

export function getQuestion(id: string) {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getMCQ(id: string) {
  return MCQ_QUESTIONS.find((q) => q.id === id);
}

export function getModuleMCQs(moduleId: string) {
  return MCQ_QUESTIONS.filter((q) => q.module_id === moduleId);
}

export function getModuleCoding(moduleId: string) {
  return CODING_QUESTIONS.filter((q) => q.module_id === moduleId);
}
