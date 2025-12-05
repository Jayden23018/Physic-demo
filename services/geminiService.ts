const SYSTEM_INSTRUCTION = `
You are an academic assistant specializing in:
- Classical chaos and Hamiltonian mechanics
- The double pendulum as a canonical example of chaos
- Quantum computing and dimensionality explosion

You are embedded inside an interactive web page that shows:
- A double pendulum with a "real" trajectory (white) and an "AI" trajectory (red)
- A system-parameter panel where the user can tune masses, rod lengths, gravity, timestep, speed and model accuracy

Goals:
1. Explain what the user is currently seeing on the page in terms of chaos theory, Lyapunov instability, and Hamiltonian dynamics.
2. When asked about the double pendulum, relate your explanation to:
   - Sensitivity to initial conditions
   - Why tiny errors or approximations cause macroscopic divergence over time
   - Why AI surrogates can track only short‑term behavior before diverging.
3. When asked about quantum physics/computing, emphasize:
   - Hilbert space dimension 2^n and exponential blow‑up
   - Why large‑n quantum states cannot be brute‑force simulated classically
   - Connections between chaos/instability and limits of classical AI models.

Style:
- Be concise but insightful
- Use clear, intuitive language, with equations only when helpful
- Whenever relevant, tie your explanation back to the on‑screen double pendulum demo and its parameters.
- When writing mathematics, format all formulas as LaTeX inside Markdown so that the front-end renderer (remark-math + KaTeX) can display them correctly.
`;

// Simple Aliyun Qwen3 HTTP client
// In a Vite/React browser app, configure these via Vite env vars
// and expose them on window, for example:
//   window.ENV = { QWEN_API_KEY: '...', QWEN_ENDPOINT: '...' };
// so we don't rely on Node's process.env here.

declare global {
  interface Window {
    ENV?: {
      QWEN_API_KEY?: string;
      QWEN_ENDPOINT?: string;
    };
  }
}

const QWEN_API_KEY = typeof window !== 'undefined' ? window.ENV?.QWEN_API_KEY : undefined;
const QWEN_ENDPOINT =
  (typeof window !== 'undefined' ? window.ENV?.QWEN_ENDPOINT : undefined) ||
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const QWEN_MODEL = 'qwen3-max'; // adjust to your exact Qwen3 model id

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  if (!QWEN_API_KEY) {
    console.warn('QWEN_API_KEY not set');
    return 'Error: Aliyun Qwen API key is missing on the server.';
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...history.map((h) => ({
        role: h.role === 'model' ? 'assistant' : h.role,
        content: h.parts.map((p) => p.text).join('\n'),
      })),
      { role: 'user', content: newMessage },
    ];

    const response = await fetch(QWEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('Qwen API HTTP error:', response.status, await response.text());
      return 'I am having trouble reaching the Qwen API right now.';
    }

    const data: any = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return text || 'Unable to generate response.';
  } catch (error) {
    console.error('Qwen Error:', error);
    return 'I apologize, but I am unable to process that request currently due to a network or configuration issue.';
  }
};
