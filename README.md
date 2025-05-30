<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TaskPilot</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1F2937;
      background-color: #F9FAFB;
    }
    .section-title {
      color: #2563EB;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .feature-list li::before {
      content: '✔️';
      margin-right: 0.5rem;
      color: #10B981;
    }
    .code-skills li::before {
      content: '💻';
      margin-right: 0.5rem;
      color: #6366F1;
    }
  </style>
</head>
<body class="p-6">
  <header class="text-center mb-10">
    <h1 class="text-4xl font-bold text-gray-800">🚀 TaskPilot</h1>
    <p class="text-gray-600 mt-2 text-lg">A comprehensive task management solution for individuals and teams</p>
  </header>

  <main class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
    <section class="mb-6">
      <h2 class="section-title">Features</h2>
      <ul class="feature-list list-disc list-inside text-gray-700 leading-relaxed">
        <li>Intuitive Task Management: Easily create, track, and manage tasks with a sortable and filterable list view.</li>
        <li>Manager Dashboard: Get a clear overview of team progress and task distribution with a dedicated manager view.</li>
        <li>Real-time Notifications: Stay informed with a built-in notification system for important updates and deadlines.</li>
        <li>Smart Task Assignment: Leverage AI assistance to optimize task assignments and prevent team overload.</li>
        <li>Automated Workflow: Benefit from automated task reassignment for missed deadlines, ensuring continuity.</li>
        <li>Dependency Tracking: Define task dependencies to ensure projects flow smoothly.</li>
        <li>User Authentication and Authorization: Secure access and role-based permissions.</li>
        <li>Responsive Design: Provides a seamless experience across different devices.</li>
      </ul>
    </section>

    <section>
      <h2 class="section-title">Coding Skills and Techniques Used</h2>
      <ul class="code-skills list-disc list-inside text-gray-700 leading-relaxed">
        <li>Next.js</li>
        <li>React</li>
        <li>TypeScript</li>
        <li>Tailwind CSS</li>
        <li>Firebase (Authentication, Firestore)</li>
        <li>Genkit (for AI features)</li>
        <li>Shadcn UI</li>
        <li>React Hook Form</li>
        <li>Zod (for validation)</li>
        <li>date-fns</li>
        <li>Git & GitHub</li>
        <li>RESTful APIs</li>
        <li>State Management (Context API)</li>
        <li>Responsive Web Design</li>
        <li>Asynchronous Programming (Promises, async/await)</li>
        <li>Error Handling</li>
        <li>Code Structure and Organization</li>
      </ul>
    </section>
  </main>

  <footer class="mt-10 text-center text-gray-500 text-sm">
    &copy; 2025 TaskPilot. All rights reserved.
  </footer>
</body>
</html>
