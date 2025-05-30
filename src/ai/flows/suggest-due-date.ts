
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
  })).min(1).describe('List of at least one suggested team member to assign the task to. If multiple members are recommended, it implies they could collaborate or the task could be split.'),
  projectedWorkloadAfterAssignment: z
    .array(z.object({
        name: z.string().describe('Name of the team member, matching one from the input list.'),
        projectedWorkload: z.number().min(0).max(100).describe('Projected workload percentage for this team member (0-100) after the task assignment. If not assigned the current task, this should be their original currentWorkload.')
    }))
    .describe('Projected workload for ALL team members originally listed in the input, after your suggested task assignment. Each member from the input must have an entry here.'),
});

export type SuggestDueDateOutput = z.infer<typeof SuggestDueDateOutputSchema>;

export async function suggestDueDate(input: SuggestDueDateInput): Promise<SuggestDueDateOutput> {
  // The client component will now fetch team members and pass them in the input.
  return suggestDueDateFlow(input);
}

const suggestDueDatePrompt = ai.definePrompt({
  name: 'suggestDueDatePrompt',
  input: {schema: SuggestDueDateInputSchema},
  output: {schema: SuggestDueDateOutputSchema},
  prompt: `You are an AI assistant expert in project management and team optimization. Your role is to help project managers assign tasks effectively.

Based on the provided task details and team member information, you will:
1. Suggest an optimal due date for the task (format: YYYY-MM-DD).
2. Recommend one or more suitable team members to assign the task to from the provided list. If multiple members are recommended, it implies they could collaborate or the task could be split. You MUST suggest at least one assignee.
3. Provide clear reasoning for both the due date suggestion and the assignee suggestion(s). For assignees, explain why they are a good fit considering their current workload and the task nature.
4. Calculate and provide the projected workload for ALL team members originally listed in the input, assuming your assignment recommendation is followed. The projected workload should reflect their load *after* this new task is hypothetically assigned to the suggested member(s). For members not assigned this specific task, their workload remains their current workload. Ensure this array contains an entry for every team member from the input.

Task Details:
- Description: {{{taskDescription}}}
- Priority: {{{priority}}}
- Current Date: {{{currentDate}}}

Team Members (Name, Current Workload %):
{{#each teamMembers}}
- {{{name}}}: {{{currentWorkload}}}%
{{/each}}

Output format:
Ensure your response is ONLY a valid JSON object adhering to the provided output schema. Do not include any explanatory text before or after the JSON.
The suggested due date must be in YYYY-MM-DD format.
Projected workloads must be a number between 0 and 100 percent.
The 'projectedWorkloadAfterAssignment' array MUST include an entry for every team member originally provided in the input.
The 'suggestedAssignees' array MUST contain at least one assignee.

Example of the expected JSON structure (DO NOT just copy this example, generate values based on the input):
{
  "suggestedDueDate": "YYYY-MM-DD",
  "reasoningForDueDate": "Detailed explanation...",
  "suggestedAssignees": [
    {
      "name": "Team Member A Name",
      "reasoningForAssignment": "Reason for assigning to A..."
    }
    // ... more assignees if applicable
  ],
  "projectedWorkloadAfterAssignment": [
    {
      "name": "Team Member A Name", // Must match a name from input
      "projectedWorkload": 75 // Example percentage
    },
    {
      "name": "Team Member B Name", // Must match a name from input
      "projectedWorkload": 50 // Example percentage
    }
    // ... and so on for ALL original team members
  ]
}
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
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
    const generationResponse = await suggestDueDatePrompt(input);
    const output = generationResponse.output;

    if (!output) {
      console.error(
        "AI response output was null or undefined from suggestDueDatePrompt. This usually means the AI's response did not match the expected schema or was blocked. Input:",
        JSON.stringify(input, null, 2),
        "Full AI generationResponse object:",
        JSON.stringify(generationResponse, null, 2)
      );
      throw new Error(
        "AI response did not yield a usable output. It might be empty, malformed, or blocked by content filters. Check the server console for the full AI response details, including any 'finishReason' or 'candidates' information."
      );
    }
     // Basic validation of output structure (Zod already does this on prompt definition if schema is well-defined)
    if (!output.suggestedDueDate || !Array.isArray(output.suggestedAssignees) || output.suggestedAssignees.length === 0 || !Array.isArray(output.projectedWorkloadAfterAssignment)) {
        console.error(
            "AI response output is missing required fields or 'suggestedAssignees' is empty. Output:",
            JSON.stringify(output, null, 2),
            "Input:",
            JSON.stringify(input, null, 2),
            "Full generationResponse:",
            JSON.stringify(generationResponse, null, 2)
        );
        throw new Error("AI response is malformed or missing critical fields. Check server logs for details on the output received from the AI.");
    }
    
    // Ensure all input team members are in the projected workload
    if (output.projectedWorkloadAfterAssignment.length !== input.teamMembers.length) {
        console.warn(
            "AI response 'projectedWorkloadAfterAssignment' does not contain an entry for every input team member. Input count:",
            input.teamMembers.length, "Output count:", output.projectedWorkloadAfterAssignment.length,
            "Output:", JSON.stringify(output.projectedWorkloadAfterAssignment, null, 2)
        );
        // Optionally, you could try to fix this here, or throw an error.
        // For now, we'll let it pass but log a warning.
    }


    return output;
  }
);

