const Groq = require("groq-sdk");

class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    if (this.apiKey) {
      this.groq = new Groq({ apiKey: this.apiKey });
    }
  }

  async chat(message, history = []) {
    if (!this.groq) return "Erro: GROQ_API_KEY não configurada.";

    try {
      const messages = [
        { role: "system", content: "Você é o Sun IA, um assistente prestativo." },
        { role: "user", content: message }
      ];

      const chatCompletion = await this.groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
        temperature: 0.7,
      });

      return chatCompletion.choices[0]?.message?.content || "Sem resposta.";
    } catch (error) {
      console.error("Erro Groq:", error);
      return "Erro ao processar mensagem na IA.";
    }
  }

  async generateCode(prompt, context = "site") {
    if (!this.groq) return "Erro: GROQ_API_KEY não configurada.";
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: `Gere o código HTML/CSS/JS para: ${prompt}` }],
        model: "llama3-8b-8192",
      });
      return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
      return "Erro ao gerar código.";
    }
  }
}

module.exports = new AIService();
