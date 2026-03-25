export interface AdminUser {
  id: string
  _id?: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'editor'
  bio?: string
  avatar?: string
  isBanned?: boolean
  lastActiveAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface AppUser {
  _id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  isBanned: boolean
  lastActiveAt?: string
  createdAt: string
  updatedAt?: string
}

export interface AuthState {
  user: AdminUser | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  user: AdminUser
  token: string
}

export interface ApiError {
  message: string
  status?: number
}

export interface ContentItem {
  _id: string
  name: string
  itemType: string
  category?: string
  subcategory?: string
  description?: string
  isPublished: boolean
  pages: object[]
  svgContent?: string
  tags?: string[]
  coverImageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ContentListResponse {
  data: ContentItem[]
  total?: number
}

export interface ContentState {
  items: ContentItem[]
  loading: boolean
  saving: boolean
  deleting: string | null
  togglingId: string | null
  error: string | null
}


export interface TemplateItem {
  _id: string
  name: string
  category?: string
  subcategory?: string
  description?: string
  isPublished: boolean
  pages: object[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}


export interface StickerItem {
  _id: string
  name: string
  category?: string
  subcategory?: string
  description?: string
  isPublished: boolean
  pages: object[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}


export interface SubCategory {
  name: string
  slug: string
}

export interface CategoryItem {
  _id: string
  name: string
  slug: string
  icon?: string
  color?: string
  itemType: string
  subcategories: SubCategory[]
  order?: number
}

export interface MainCategory {
  _id: string
  name: string
  slug: string
  icon?: string
  color?: string
  order?: number
}


export interface AppSettings {
  appName: string
  appDescription: string
  supportEmail: string
  contactUrl: string
  maintenanceMode: boolean
  maintenanceMessage: string
  allowNewRegistrations: boolean
  sessionTimeoutHours: number
  maxLoginAttempts: number
  requireStrongPassword: boolean
  enableEmailNotifications: boolean
  notifyOnNewUser: boolean
  notifyOnContentPublish: boolean
  notifyOnLogin: boolean
  verificationCodeExpiry: number
  maxCodeVerifyAttempts: number
  maxCodeResendAttempts: number
  codeResendCooldown: number
  codeSessionResetTime: number
  maxForgotPasswordAttempts: number
  forgotPasswordWindowMinutes: number
}

export interface SettingsEnvelope {
  success: boolean
  data: AppSettings
}

export interface SettingsMessageEnvelope {
  success: boolean
  message: string
  data?: AppSettings
}

export interface SettingsState {
  data: AppSettings | null
  loading: boolean
  saving: boolean
  error: string | null
}

export interface PermissionEntry {
  _id?: string
  scope: string
  targetType: string
  enabled: boolean
  placementRole?: 'primary' | 'secondary' | null
  allowedCategories?: string[]
  allowedItems?: string[]
}


export interface UsersState {
  adminUsers: AdminUser[]
  appUsers: AppUser[]
  adminTotal: number
  appTotal: number
  adminPages: number
  appPages: number
  loading: boolean
  error: string | null
  actionLoading: boolean
  actionError: string | null
}


export interface UpdateProfilePayload {
  name?: string
  email?: string
  avatar?: string
  bio?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}


export interface ToastState {
  msg: string
  type: 'success' | 'error' | 'info'
}


export interface PaginatedParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedUsersResponse {
  users: AdminUser[] | AppUser[]
  total: number
  pages: number
  page: number
}

export interface DashboardTrendPoint {
  date: string
  count: number
}

export interface DashboardAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
}

export interface DashboardOverview {
  generatedAt: string
  windowDays: number
  kpis: {
    totalUsers: number
    appUsers: number
    adminUsers: number
    activeUsersInWindow: number
    totalContent: number
    publishedContent: number
    draftContent: number
    publishRate: number
    bannedAppUsers: number
  }
  trends: {
    userSignups: DashboardTrendPoint[]
    contentCreated: DashboardTrendPoint[]
    contentPublished: DashboardTrendPoint[]
  }
  contentByType: Array<{ type: string; count: number; share: number }>
  recent: {
    users: Array<{
      id: string
      name: string
      email: string
      isBanned: boolean
      createdAt: string
      lastActiveAt?: string
    }>
    content: Array<{
      id: string
      name: string
      itemType: string
      category?: string
      isPublished: boolean
      updatedAt: string
    }>
  }
  alerts: DashboardAlert[]
}

export interface DashboardOverviewEnvelope {
  success: boolean
  data: DashboardOverview
}
