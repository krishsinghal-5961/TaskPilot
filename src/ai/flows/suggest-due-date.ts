
// Implemented Genkit flow for suggesting task due dates based on team workload.

'use server';

/**
 * @fileOverview AI-powered due date suggestion for tasks, considering team workload.
 *
 * - suggestDueDate - A function that suggests a due date for a task.
 * - SuggestDueDateInput - The input type for the suggestDueDate function.
 * - SuggestDueDateOutput - The return type for the suggestDueDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDueDateInputSchema = z.object({
  taskDescription: z.string().describe('Description of the task to be completed.'),
  teamMembers: z
    .array(z.object({name: z.string(), currentWorkload: z.number().min(0).max(100)}))
    .describe('List of team members and their current workload as a percentage.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority of the task.'),
});

export type SuggestDueDateInput = z.infer<typeof SuggestDueDateInputSchema>;

const SuggestDueDateOutputSchema = z.object({
  suggestedDueDate: z.string().describe('Suggested due date for the task in ISO format (YYYY-MM-DD).'),
  reasoning: z.string().describe('Explanation for why the suggested due date was chosen.'),
  workloadAllocation: z
    .array(z.object({name: z.string(), projectedWorkload: z.number().min(0).max(100)}))
    .describe('Projected workload for each team member after task assignment.'),
});

export type SuggestDueDateOutput = z.infer<typeof SuggestDueDateOutputSchema>;

export async function suggestDueDate(input: SuggestDueDateInput): Promise<SuggestDueDateOutput> {
  return suggestDueDateFlow(input);
}

const suggestDueDatePrompt = ai.definePrompt({
  name: 'suggestDueDatePrompt',
  input: {schema: SuggestDueDateInputSchema},
  output: {schema: SuggestDueDateOutputSchema},
  prompt: `You are an AI assistant helping project managers determine the best due date for new tasks.

  Consider the following factors when suggesting a due date:
  - Task description: {{{taskDescription}}}
  - Team members and their current workload:
  {{#each teamMembers}}
  - Name: {{{name}}}, Workload: {{{currentWorkload}}}%
  {{/each}}
  - Priority: {{{priority}}}

  Suggest a due date that avoids overburdening team members while ensuring timely task completion.
  Provide a clear reasoning for your suggestion, and the workload allocation for each team member after assigning the task.
  The current date is {{now format='YYYY-MM-DD'}}.
  Output the suggested due date in ISO format (YYYY-MM-DD).
  Ensure that all projected workload are between 0 and 100.
  Always respond in JSON format.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const suggestDueDateFlow = ai.defineFlow(
  {
    name: 'suggestDueDateFlow',
    inputSchema: SuggestDueDateInputSchema,
    outputSchema: SuggestDueDateOutputSchema,
  },
  async input => {
    const {output} = await suggestDueDatePrompt(input);
    if (!output) {
      console.error("AI response did not conform to the output schema for suggestDueDatePrompt. Input:", input);
      throw new Error("AI response did not conform to the expected output schema. The response might be empty, malformed, or blocked by content filters.");
    }
    return output;
  }
);

