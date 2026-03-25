import Api from './api'
import type { DashboardOverview, DashboardOverviewEnvelope } from './types'

const DashboardApi = {
  async getOverview(days = 30): Promise<DashboardOverview> {
    const res = await Api.get<DashboardOverviewEnvelope>('/dashboard/overview', { days })
    return res.data
  },
}

export default DashboardApi
