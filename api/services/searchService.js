const { getJson } = require("serpapi");

/**
 * Serviço de Busca em Tempo Real (Real - SerpApi Free Tier)
 * Fornece 100 buscas gratuitas por mês.
 */
class SearchService {
  constructor() {
    this.apiKey = process.env.SERPAPI_KEY;
  }

  /**
   * Realiza uma busca real no Google
   * @param {string} query - Termo de busca
   * @returns {Promise<Array>} - Lista de resultados formatados
   */
  async search(query) {
    if (!this.apiKey || this.apiKey.includes('xxxx')) {
      console.warn("[SearchService] SERPAPI_KEY não configurada. Retornando mock.");
      return this.getMockResults(query);
    }

    console.log(`[SearchService] Buscando no Google por: ${query}`);

    try {
      const response = await getJson({
        engine: "google",
        api_key: this.apiKey,
        q: query,
        hl: "pt-br",
        gl: "br",
      });

      // Extrai resultados orgânicos (limita a 5 para não estourar o contexto)
      const results = (response.organic_results || []).slice(0, 5).map(res => ({
        title: res.title,
        link: res.link,
        snippet: res.snippet
      }));

      return results;
    } catch (error) {
      console.error("[SearchService] Erro na busca real:", error);
      return this.getMockResults(query);
    }
  }

  /**
   * Fallback para resultados simulados
   */
  getMockResults(query) {
    return [
      { title: `Resultado Simulado para ${query}`, link: "#", snippet: "Configure sua SERPAPI_KEY gratuita para ver resultados reais aqui." }
    ];
  }
}

module.exports = new SearchService();
