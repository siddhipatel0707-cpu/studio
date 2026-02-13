'use server';
/**
 * @fileOverview This file implements a Genkit flow that generates a personalized
 * AI-driven financial explanation based on simulated financial decisions.
 *
 * - getAIFinancialInsight - A function that handles the AI explanation generation process.
 * - AIFinancialInsightInput - The input type for the getAIFinancialInsight function.
 * - AIFinancialInsightOutput - The return type for the getAIFinancialInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIFinancialInsightInputSchema = z.object({
  income: z.number().describe("The user's monthly income."),
  totalEmiAfterDecision: z.number().describe('Total EMIs after the new financial decision.'),
  stressRatio: z.number().describe('The financial stress ratio (Total EMI / Monthly Income).'),
  retirementCorpusBefore: z.number().describe('Projected retirement corpus before the new decision.'),
  retirementCorpusAfter: z.number().describe('Projected retirement corpus after the new decision.'),
  retirementDelay: z.number().describe('Calculated delay in retirement due to the decision, in years.'),
});
export type AIFinancialInsightInput = z.infer<typeof AIFinancialInsightInputSchema>;

// This is the structured output we expect from the LLM
const AIFinancialInsightStructuredOutputSchema = z.object({
  simpleExplanation: z.string().describe("A simple explanation of the financial situation in human language."),
  emotionalImpact: z.string().describe("The emotional impact this decision might have."),
  riskLevel: z.string().describe("An explanation of the risk level associated with this decision."),
  saferAlternative: z.string().describe("One practical, safer alternative the user could consider."),
});

// The final output of the flow is a single string
const AIFinancialInsightOutputSchema = z.string().describe('A personalized AI-generated financial explanation.');
export type AIFinancialInsightOutput = z.infer<typeof AIFinancialInsightOutputSchema>;

export async function getAIFinancialInsight(input: AIFinancialInsightInput): Promise<AIFinancialInsightOutput> {
  return aiFinancialInsightFlow(input);
}

const aiFinancialInsightPrompt = ai.definePrompt({
  name: 'aiFinancialInsightPrompt',
  input: {schema: AIFinancialInsightInputSchema},
  output: {schema: AIFinancialInsightStructuredOutputSchema},
  prompt: `You are a supportive, non-judgmental financial advisor. Based on the following financial data, provide a personalized explanation of the impact of the user's financial decision on their retirement. Your explanation should be easy for a 16-year-old to understand, be limited to 200 words, and cover the following points.
Respond with a JSON object that matches the provided schema.

User Financial Data:
Income: ₹{{{income}}}
Total EMI After Decision: ₹{{{totalEmiAfterDecision}}}
Stress Ratio: {{{stressRatio}}}
Retirement Corpus Before: ₹{{{retirementCorpusBefore}}}
Retirement Corpus After: ₹{{{retirementCorpusAfter}}}
Retirement Delay: {{{retirementDelay}}} years`,
});

const aiFinancialInsightFlow = ai.defineFlow(
  {
    name: 'aiFinancialInsightFlow',
    inputSchema: AIFinancialInsightInputSchema,
    outputSchema: AIFinancialInsightOutputSchema,
  },
  async input => {
    const {output} = await aiFinancialInsightPrompt(input);
    if (!output) {
      throw new Error('AI did not return a valid explanation.');
    }
    
    // Combine the structured output into a single string for display
    const { simpleExplanation, emotionalImpact, riskLevel, saferAlternative } = output;
    return [simpleExplanation, emotionalImpact, riskLevel, saferAlternative].join('\n\n');
  }
);
