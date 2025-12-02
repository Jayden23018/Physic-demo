import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are a high-level academic assistant specializing in Physics and Computer Science, specifically tailored for a discussion with Professor Yao (Tsinghua/HKU).
Your tone should be respectful, rigorous, yet innovative—suitable for a talented undergraduate or high school researcher.

Context:
1. The user is presenting a web demo comparing Classical Chaos (Double Pendulum) vs. AI Approximation.
2. The user is also demonstrating the "Dimensionality Explosion" in Quantum Computing where classical AI fails to model the state space.

When asked about the Double Pendulum:
- Explain that while Neural Networks can approximate the Hamiltonian, the Lyapunov exponent causes divergent errors in the long term ($t \to \infty$).
- Discuss how the "Red Line" (Simulated/AI) diverges from the "White Line" (Real) due to floating point or approximation errors amplifying exponentially.

When asked about Quantum Physics/Computing:
- Focus on the Hilbert Space dimension $2^n$.
- Explain that for $n=50$, $2^{50}$ is too large for classical RAM, making "brute force" AI modeling of entanglement impossible without tensor networks or quantum-inspired algorithms.
- Reference "Quantum Supremacy" and the difficulty of representing the wavefunction $\psi$ classically.

Keep answers concise but insightful.
`;

let aiClient: GoogleGenAI | null = null;

export const initGenAI = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  if (!aiClient) aiClient = initGenAI();
  if (!aiClient) return "Error: API Key missing.";

  try {
    const model = aiClient.models;
    
    // Construct prompt with history context manually for single-turn or use chat if persistent
    // Here we use generateContent for simplicity but structure it to respect context if needed.
    // Ideally, use chat session. Let's use chat session pattern.
    
    const chat = aiClient.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result?.text || "Unable to generate response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I apologize, but I am unable to process that request currently due to a network or configuration issue.";
  }
};
