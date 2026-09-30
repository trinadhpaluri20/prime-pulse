import { fetchApi } from './api';
import { Competitor } from '../types';
import { mockCompetitors } from '../mock/mockData';

export const competitorApi = {
  async getCompetitors(): Promise<Competitor[]> {
    try {
      const data = await fetchApi<any[]>('/competitors');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          name: c.name,
          website: c.website,
          industry: c.industry || 'Enterprise AI',
          description: c.description,
          tier: 'Tier 1 - Primary',
          threatLevel: 'high',
          techStack: ['Distributed LLM', 'Vector DB', 'Kubernetes'],
          activeSignalsCount: 8,
          lastActive: 'Active today',
        }));
      }
      return mockCompetitors;
    } catch (err) {
      console.warn('[competitorApi] Backend offline, falling back to mock competitors:', err);
      return mockCompetitors;
    }
  },

  async getCompetitorById(id: number): Promise<Competitor | undefined> {
    try {
      const c = await fetchApi<any>(`/competitors/${id}`);
      return {
        id: c.id,
        name: c.name,
        website: c.website,
        industry: c.industry || 'Enterprise AI',
        description: c.description,
        tier: 'Tier 1 - Primary',
        threatLevel: 'high',
        techStack: ['Distributed LLM', 'Vector DB', 'Kubernetes'],
        activeSignalsCount: 8,
        lastActive: 'Active today',
      };
    } catch (err) {
      return mockCompetitors.find((comp) => comp.id === id);
    }
  },
};
