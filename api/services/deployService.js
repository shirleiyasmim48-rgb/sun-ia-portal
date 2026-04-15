const { Octokit } = require("octokit");
const fetch = require('node-fetch');

/**
 * Serviço de Deploy Automático (Real - GitHub/Vercel Free Tier)
 * Utiliza as APIs gratuitas do GitHub e Vercel para publicação.
 */
class DeployService {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.vercelToken = process.env.VERCEL_TOKEN;
    
    if (this.githubToken && !this.githubToken.includes('xxxx')) {
      this.octokit = new Octokit({ auth: this.githubToken });
    }
  }

  /**
   * Realiza o deploy real de um código HTML/CSS/JS
   * @param {string} code - Código fonte (HTML completo)
   * @param {string} projectName - Nome do projeto
   * @returns {Promise<Object>} - Status e URL do deploy
   */
  async deploy(code, projectName) {
    if (!this.githubToken || !this.vercelToken || this.githubToken.includes('xxxx')) {
      console.warn("[DeployService] Tokens não configurados. Retornando mock.");
      return this.getMockResults(projectName);
    }

    const repoName = `ai-gen-${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    console.log(`[DeployService] Iniciando deploy real para: ${repoName}`);

    try {
      // 1. Criar repositório no GitHub (Gratuito)
      const { data: repo } = await this.octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        private: false,
        auto_init: false,
        description: `Site gerado por IA: ${projectName}`
      });

      // 2. Criar arquivo index.html no repositório
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: repo.owner.login,
        repo: repo.name,
        path: "index.html",
        message: "Initial commit from AI Portal",
        content: Buffer.from(code).toString('base64'),
      });

      // 3. Criar Deploy na Vercel via API (Gratuito para Hobby)
      const vercelResponse = await fetch(`https://api.vercel.com/v13/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          gitSource: {
            type: 'github',
            repoId: repo.id,
            ref: 'main'
          },
          projectSettings: {
            framework: null,
            buildCommand: null,
            outputDirectory: null,
            installCommand: null
          }
        })
      });

      if (!vercelResponse.ok) {
        const error = await vercelResponse.json();
        throw new Error(`Erro na Vercel API: ${JSON.stringify(error)}`);
      }

      const vercelData = await vercelResponse.json();

      return {
        status: 'success',
        url: `https://${vercelData.alias[0] || vercelData.url}`,
        githubUrl: repo.html_url,
        message: `Projeto "${projectName}" publicado com sucesso via GitHub e Vercel!`
      };
    } catch (error) {
      console.error("[DeployService] Erro no deploy real:", error);
      throw error;
    }
  }

  /**
   * Fallback para resultados simulados
   */
  getMockResults(projectName) {
    return {
      status: 'success',
      url: `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
      githubUrl: `https://github.com/ai-portal/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
      message: `[MODO DEMO] Configure GITHUB_TOKEN e VERCEL_TOKEN gratuitos para realizar o deploy real.`
    };
  }
}

module.exports = new DeployService();
