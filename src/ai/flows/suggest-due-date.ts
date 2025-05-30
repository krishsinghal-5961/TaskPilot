
// Implemented Genkit flow for suggesting task due dates based on team workload.

'use server';

/**
 * @fileOverview AI-powered due date and assignee suggestion for tasks, considering team workload.
 *
 * - suggestDueDate - A function that suggests a due date and assignee(s) for a task.
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
  currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
});

export type SuggestDueDateInput = z.infer<typeof SuggestDueDateInputSchema>;

const SuggestDueDateOutputSchema = z.object({
  suggestedDueDate: z.string().describe('Suggested due date for the task in ISO format (YYYY-MM-DD).'),
  reasoningForDueDate: z.string().describe('Explanation for why the suggested due date was chosen.'),
  suggestedAssignees: z.array(z.object({
    name: z.string().describe('Name of the suggested team member.'),
    reasoningForAssignment: z.string().describe('Explanation for why this member was suggested for the task.'),
  })).describe('List of suggested team members to assign the task to. If multiple members are recommended, it implies they could collaborate or the task could be split.'),
  projectedWorkloadAfterAssignment: z
    .array(z.object({name: z.string(), projectedWorkload: z.number().min(0).max(100)}))
    .describe('Projected workload for ALL originally listed team members after the suggested task assignment (even those not assigned the current task).'),
});

export type SuggestDueDateOutput = z.infer<typeof SuggestDueDateOutputSchema>;

export async function suggestDueDate(input: SuggestDueDateInput): Promise<SuggestDueDateOutput> {
  return suggestDueDateFlow(input);
}

const suggestDueDatePrompt = ai.definePrompt({
  name: 'suggestDueDatePrompt',
  input: {schema: SuggestDueDateInputSchema},
  output: {schema: SuggestDueDateOutputSchema},
  prompt: `You are an AI assistant expert in project management and team optimization. Your role is to help project managers assign tasks effectively.

Based on the provided task details and team member information, you will:
1. Suggest an optimal due date for the task.
2. Recommend one or more suitable team members to assign the task to from the provided list. If multiple members are recommended, it implies they could collaborate or the task could be split.
3. Provide clear reasoning for both the due date suggestion and the assignee suggestion(s). For assignees, explain why they are a good fit considering their current workload and the task nature.
4. Calculate and provide the projected workload for ALL team members originally listed, assuming your assignment recommendation is followed. The projected workload should reflect their load *after* this new task is hypothetically assigned to the suggested member(s). For members not assigned this specific task, their workload remains their current workload.

Task Details:
- Description: {{{taskDescription}}}
- Priority: {{{priority}}}
- Current Date: {{{currentDate}}}

Team Members (Name, Current Workload %):
{{#each teamMembers}}
- {{{name}}}: {{{currentWorkload}}}%
{{/each}}

Consider the following when making your suggestions:
- Task complexity and priority.
- Current workload of each team member. Aim for balanced distribution and avoid overburdening.
- Timely completion of the task.
- The nature of the task and potential skills implied (though not explicitly provided, you can infer generally).

Output format:
Ensure your response is in JSON format, adhering to the provided output schema.
The suggested due date should be in YYYY-MM-DD format.
Projected workloads must be between 0 and 100 percent.
The 'projectedWorkloadAfterAssignment' array should include an entry for every team member originally provided in the input, showing their workload *after* your suggested assignment.
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
      console.error("AI response did not conform to the output schema for suggestDueDatePrompt. Input:", input, "Raw AI response object:", await suggestDueDatePrompt(input));
      throw new Error("AI response did not conform to the expected output schema. The response might be empty, malformed, or blocked by content filters. Check the server console for more details.");
    }
    return output;
  }
);
