import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Require the Groq API key to be set in the environment
if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not set. Please set it in your .env file.');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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