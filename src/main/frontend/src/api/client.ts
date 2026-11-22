import axios from 'axios'
import type {
  AssignmentRecommendation, RiskItem, SprintAnalysis, SprintDetail,
  SprintHealth, SprintPrediction, SprintSummary,
} from '../types/sprint'

const api = axios.create({ baseURL: '/api/v1', timeout: 20000 })

export const sprintApi = {
  listSprints: () => api.get<SprintSummary[]>('/sprints').then(({ data }) => data),
  getActiveSprint: () => api.get<SprintDetail>('/sprints/active').then(({ data }) => data),
  getSprint: (id: string) => api.get<SprintDetail>(`/sprints/${encodeURIComponent(id)}`).then(({ data }) => data),
  getAnalysis: (id: string) => api.get<SprintAnalysis>(`/sprints/${encodeURIComponent(id)}/analysis`).then(({ data }) => data),
  getHealth: (id: string) => api.get<SprintHealth>(`/sprints/${encodeURIComponent(id)}/health`).then(({ data }) => data),
  getPrediction: (id: string) => api.get<SprintPrediction>(`/sprints/${encodeURIComponent(id)}/prediction`).then(({ data }) => data),
  getRisks: (id: string) => api.get<RiskItem[]>(`/sprints/${encodeURIComponent(id)}/risks`).then(({ data }) => data),
  getRecommendations: (id: string) => api.get<AssignmentRecommendation[]>(`/sprints/${encodeURIComponent(id)}/recommendations`).then(({ data }) => data),
  refresh: () => api.post('/sprints/refresh'),
}

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return 'No matching sprint was found. Choose another sprint or check your Jira board.'
    if (error.code === 'ERR_NETWORK') return 'The dashboard cannot reach the backend. Start the Spring Boot app and try again.'
    const message = (error.response?.data as { message?: string } | undefined)?.message
    if (message) return message
    if (error.response?.status && error.response.status >= 500) return 'Jira could not provide sprint data. Check the Jira connection settings and try again.'
  }
  return 'Something went wrong while loading sprint data. Please try again.'
}
