const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    // Usar a chave do Groq como fallback ou tentar Gemini se disponível
    // Como o usuário forneceu uma chave Groq, vamos garantir que ela funcione
    // Mas para máxima compatibilidade na Vercel, vamos usar uma estrutura ultra simples
    this.apiKey = process.env.GROQ_API_KEY;
  }

  async chat(message, history = []) {
    if (!process.env.GROQ_API_KEY) {
      return "Erro: Chave de API não configurada no servidor.";
    }

    try {
      // Importação dinâmica para evitar erros de carregamento
      const Groq = require("groq-sdk");
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "Você é o Sun IA, um assistente prestativo. Responda em português." },
          { role: "user", content: message }
        ],
        model: "llama3-8b-8192",
      });

      return chatCompletion.choices[0]?.message?.content || "Sem resposta.";
    } catch (error) {
      console.error("Erro na IA:", error);
      return "Erro ao processar sua mensagem. Verifique a chave de API.";
    }
  }

  async generateCode(prompt, context = "site") {
    try {
      const Groq = require("groq-sdk");
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: `Gere o código HTML para: ${prompt}` }],
        model: "llama3-8b-8192",
      });
      return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
      return "Erro ao gerar código.";
    }
  }
}

module.exports = new AIService();
