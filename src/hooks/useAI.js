import { useState } from 'react';
import openai from '../lib/openai';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function callAI(systemPrompt, userPrompt, expectJson = false) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const text = response.choices[0].message.content;
      setIsLoading(false);

      if (expectJson) {
        // Strip markdown code fences in case the model wraps JSON in ```json ... ```
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      }

      return text;
    } catch (err) {
      console.error('AI call failed:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
      return null;
    }
  }

  return { callAI, isLoading, error };
}