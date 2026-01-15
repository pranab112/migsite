import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BusinessSolution, StudyPlan, ConceptExplanation, QuizQuestion, PracticalTask, ChatMessage, Recommendation } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * UTILITY: Trims chat history to save input tokens. 
 */
const compactHistory = (history: ChatMessage[]) => {
  if (history.length <= 6) return history;
  return history.slice(-6); 
};

export const generateMasteryChallenge = async (topic: string, weekTitle: string, concepts: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Test mastery for "${weekTitle}" in "${topic}". Key concepts: ${concepts.join(', ')}. Create 1 tough application scenario + 1 question.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    return "Mastery check offline.";
  }
};

export const generateBusinessAdvice = async (
  businessDescription: string,
  industry: string
): Promise<BusinessSolution[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Industry: ${industry}. Description: ${businessDescription}. 3 AI growth/automation solutions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              impact: { type: Type.STRING },
              description: { type: Type.STRING },
              iconType: { type: Type.STRING, enum: ['automation', 'insight', 'growth'] }
            },
            required: ["title", "impact", "description", "iconType"]
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    throw error;
  }
};

export const generateStudyRoadmap = async (topic: string, level: string): Promise<StudyPlan> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `4-week ${level} level plan for ${topic}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["week", "title", "description", "keyConcepts"]
              }
            }
          },
          required: ["topic", "difficulty", "roadmap"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    throw error;
  }
};

export const explainConcept = async (concept: string, contextTopic: string): Promise<ConceptExplanation> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Explain "${concept}" for learning "${contextTopic}". One practical tip.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            definition: { type: Type.STRING },
            example: { type: Type.STRING },
            practicalTip: { type: Type.STRING }
          },
          required: ["concept", "definition", "example", "practicalTip"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    throw error;
  }
};

export const getGroundedResources = async (concept: string, topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resources for "${concept}" in "${topic}".`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks.filter((c: any) => c.web?.uri).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
    return { text: response.text, links };
  } catch (error) {
    return { text: "", links: [] };
  }
};

export const getMentorResponse = async (history: ChatMessage[], newMessage: string, planContext: StudyPlan): Promise<string> => {
  try {
    const activeHistory = compactHistory(history);
    const context = `Tutor for ${planContext.topic}. Level: ${planContext.difficulty}. Respond concisely.`;
    let prompt = `${context}\n`;
    activeHistory.forEach(msg => prompt += `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.text}\n`);
    prompt += `Student: ${newMessage}\nAI:`;

    const response = await ai.models.generateContent({ 
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "I'm processing...";
  } catch (error) {
    return "Offline.";
  }
};

/**
 * Weekly Quiz: 10 Questions
 */
export const generateQuiz = async (topic: string, weekTitle: string, concepts: string[]): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Create a 10-question multiple choice quiz for "${weekTitle}" in "${topic}". Focus on concepts: ${concepts.join(', ')}. Ensure varied difficulty.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    throw error;
  }
};

/**
 * Final Mastery Exam: 20 Questions spanning the whole roadmap.
 */
export const generateFinalExam = async (topic: string, roadmap: any[]): Promise<QuizQuestion[]> => {
  try {
    const summary = roadmap.map(r => r.title).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 20-question CUMULATIVE Final Mastery Exam for the course "${topic}". Topics covered: ${summary}. Questions should be challenging and cover all modules.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    throw error;
  }
};

export const generatePracticalTask = async (topic: string, weekTitle: string, concepts: string[]): Promise<PracticalTask> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Practical lab for ${weekTitle}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenario: { type: Type.STRING },
            taskSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutcome: { type: Type.STRING }
          },
          required: ["title", "scenario", "taskSteps", "expectedOutcome"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    throw error;
  }
};
