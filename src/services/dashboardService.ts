import DashboardApi from '../api/dashboardApi'
import type { DashboardOverview } from '../api/types'

class DashboardService {
  static async getOverview(days = 30): Promise<DashboardOverview> {
    return DashboardApi.getOverview(days)
  }
}

export default DashboardService
