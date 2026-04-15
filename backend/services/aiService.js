const Groq = require("groq-sdk");
const systemPrompt = require('../../config/systemPrompt');

/**
 * AIService (Groq Edition)
 * Utiliza a API da Groq (Llama 3) para chat e geração de código.
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    if (this.apiKey && !this.apiKey.includes('xxxx')) {
      this.groq = new Groq({ apiKey: this.apiKey });
    } else {
      console.warn("[AIService] GROQ_API_KEY não configurada. O serviço funcionará em modo de demonstração.");
      this.isDemo = true;
    }
  }

  async chat(message, history = []) {
    if (this.isDemo) {
      return `[MODO DEMO] Esta é uma resposta simulada para: "${message}". Configure uma GROQ_API_KEY válida no arquivo .env para usar a IA real.`;
    }

    try {
      // Converte o histórico para o formato da Groq
      const messages = [
        { role: "system", content: systemPrompt.content },
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.parts[0].text
        })),
        { role: "user", content: message }
      ];

      const chatCompletion = await this.groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 1024,
      });

      return chatCompletion.choices[0]?.message?.content || "Sem resposta da IA.";
    } catch (error) {
      console.error("[AIService] Erro no Chat Groq:", error);
      throw error;
    }
  }

  async generateCode(prompt, context = "site") {
    if (this.isDemo) {
      return `<!DOCTYPE html><html><body style="background:#121212;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;"><div><h1>${context.toUpperCase()} (MODO DEMO)</h1><p>Tema: ${prompt}</p><p>Configure sua API Key para gerar código real.</p></div></body></html>`;
    }

    try {
      const fullPrompt = `Crie um ${context} moderno e funcional em HTML, CSS e JS puro: "${prompt}". 
      Retorne APENAS o código HTML completo em um único arquivo, sem explicações ou Markdown.`;
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: fullPrompt }],
        model: "llama3-70b-8192", // Modelo maior para código
        temperature: 0.3,
      });

      let code = chatCompletion.choices[0]?.message?.content || "";
      return code.replace(/```html/g, '').replace(/```/g, '').trim();
    } catch (error) {
      console.error("[AIService] Erro na Geração de Código Groq:", error);
      throw error;
    }
  }
}

module.exports = new AIService();
