import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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',
});

/**
 * Get a chat completion from Groq
 * @param {string[]} messages - Array of user messages (strings)
 * @returns {Promise<string>} - The model's reply
 */
export async function getGroqChatCompletion(messages) {
  if (!messages || messages.length === 0) return '';
  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: messages.map((msg) => ({ role: 'user', content: msg })),
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    throw new Error('Failed to get Groq chat completion');
  }
}

/**
 * Generate an embedding for an array of skills (joined as a string)
 * @param {string[]} skills
 * @returns {Promise<number[]>}
 */
export async function getSkillsEmbedding(skills) {
  if (!skills || skills.length === 0) return null;
  const input = skills.join(', ');
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error.response?.data || error.message);
    throw new Error('Failed to generate embedding');
  }
} 