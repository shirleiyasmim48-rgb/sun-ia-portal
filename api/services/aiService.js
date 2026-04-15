const Groq = require("groq-sdk");

class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.groq = null;
    if (this.apiKey) {
      this.groq = new Groq({ apiKey: this.apiKey });
    }
  }

  async chat(message, history = []) {
    // Tentar inicializar se ainda não estiver
    if (!this.groq && process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    if (!this.groq) {
      console.error("[AIService] GROQ_API_KEY não encontrada nas variáveis de ambiente.");
      return "Erro: A chave da IA não foi configurada no servidor.";
    }

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: "system", content: "Você é o Sun IA, um assistente de inteligência artificial elegante, prestativo e amigável. Responda sempre em português brasileiro." },
          { role: "user", content: message }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 1024,
      });

      return chatCompletion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta agora.";
    } catch (error) {
      console.error("[AIService] Erro detalhado na Groq:", error);
      return "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em instantes.";
    }
  }

  async generateCode(prompt, context = "site") {
    if (!this.groq && process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    
    if (!this.groq) return "Erro: Chave de API não configurada.";

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: "system", content: "Você é um desenvolvedor expert. Gere apenas o código solicitado, sem explicações." },
          { role: "user", content: `Gere o código HTML completo (com CSS e JS inclusos) para um ${context}: ${prompt}` }
        ],
        model: "llama3-8b-8192",
        temperature: 0.3,
      });
      
      let code = chatCompletion.choices[0]?.message?.content || "";
      // Limpar markdown se houver
      return code.replace(/```html/g, '').replace(/```/g, '').trim();
    } catch (error) {
      console.error("[AIService] Erro ao gerar código:", error);
      return "Erro ao gerar o código solicitado.";
    }
  }
}

module.exports = new AIService();
