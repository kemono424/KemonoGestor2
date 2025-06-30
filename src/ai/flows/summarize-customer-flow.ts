'use server';
/**
 * @fileOverview An AI flow to generate a summary of a customer's activity.
 *
 * - summarizeCustomer - A function that handles the customer summarization.
 * - SummarizeCustomerInput - The input type for the summarizeCustomer function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  pendingDebt: z.number(),
});

const TripSchema = z.object({
  id: z.string(),
  status: z.string(),
  origin: z.string(),
  destination: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
});

export const SummarizeCustomerInputSchema = z.object({
  customer: CustomerSchema,
  trips: z.array(TripSchema),
});
export type SummarizeCustomerInput = z.infer<typeof SummarizeCustomerInputSchema>;

export async function summarizeCustomer(input: SummarizeCustomerInput): Promise<string> {
    return summarizeCustomerFlow(input);
}

const prompt = ai.definePrompt({
    name: 'summarizeCustomerPrompt',
    input: { schema: SummarizeCustomerInputSchema },
    prompt: `You are a helpful business analyst for a taxi company. Your goal is to provide a concise summary of a customer's profile based on their data.

    Customer Information:
    - Name: {{customer.name}}
    - Pending Debt: \${{customer.pendingDebt}}

    Trip History (most recent first):
    {{#if trips}}
      {{#each trips}}
      - From "{{this.origin}}" to "{{this.destination}}", Status: {{this.status}} on {{this.startTime}}
      {{/each}}
    {{else}}
      - No trips on record.
    {{/if}}

    Based on this information, provide a 2-3 sentence summary covering:
    1. Their loyalty/activity level (e.g., frequent, occasional, new).
    2. Their financial standing (mention if they have debt).
    3. A concluding remark about their value or risk profile.

    Example: "This is a frequent and reliable customer with a consistent travel history. They currently have no outstanding debt, making them a low-risk, high-value client."
    
    Keep the summary professional and brief.
    `,
});

const summarizeCustomerFlow = ai.defineFlow(
    {
        name: 'summarizeCustomerFlow',
        inputSchema: SummarizeCustomerInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        const {text} = await prompt(input);
        return text;
    }
);
