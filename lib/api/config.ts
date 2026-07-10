/**
 * API Configuration
 * Central configuration for all API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: 'https://api.parcego.com',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    ME: '/auth/me',
    // Admin endpoints
    ADMIN_CREATE_USER: '/auth/admin/create-user',
    ADMIN_LIST_USERS: '/auth/admin/users',
    ADMIN_UPDATE_USER_ROLE: '/auth/admin/users/:user_id/role',
    ADMIN_IMPERSONATE_USER: '/auth/admin/users/:user_id/impersonate',
    ADMIN_ASSIGNMENTS_TODAY: '/admin/assignments/today',
    ADMIN_ASSIGNMENTS_BY_DATE: '/admin/assignments/:assignment_date',
    ADMIN_ASSIGNMENT_STATISTICS: '/admin/assignments/statistics/:assignment_date',
    ADMIN_REASSIGN_ASSIGNMENT: '/admin/assignments/:assignment_id/reassign',
    ADMIN_MANUAL_ASSIGNMENT: '/admin/assignments/manual',
    ADMIN_RUN_AUTOMATED_ASSIGNMENT: '/admin/assignments/run-automated',
    ADMIN_CLEAR_ALL_ASSIGNMENTS: '/admin/assignments/clear-all',
  },
  USERS: {
    PROFILE: '/profile',
    UPDATE_PROFILE: '/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  SHIPMENTS: {
    CREATE: '/shipments',
    LIST: '/shipments',
    SEARCH: '/shipments/search',
    GET: '/shipments/:id',
    UPDATE: '/shipments/:id',
    DELIVERY_SPEED: '/shipments/:id/delivery-speed',
    DELETE: '/shipments/:id',
    TRACK: '/shipments/:id/track',
    LABEL: '/shipments/:id/label',
    UPDATE_STATUS: '/shipments/:id/status',
    STATUS_HISTORY: '/shipments/:id/status-history',
    STATUS_DURATION: '/shipments/:id/status-duration/:status',
    BY_STATUS_DURATION: '/shipments/by-status-duration/:status',
    INITIALIZE_STATUS_TRACKING: '/shipments/initialize-status-tracking',
    ADMIN_MOVE_TO_WAREHOUSE: '/admin/shipments/move-to-warehouse',
    ADMIN_LIST_PAID: '/admin/shipments/paid',
    ADMIN_LIST_ASSIGNABLE: '/admin/shipments/assignable',
    ADMIN_MOVE_SINGLE_TO_WAREHOUSE: '/admin/shipments/:shipment_id/move-to-warehouse',
  },
  TRACKING: {
    TRACK: '/tracking/:trackingNumber',
    EVENTS: '/tracking/:trackingNumber/events',
    PUBLIC_TRACK: '/track/:tracking_code',
    PUBLIC_STATUS: '/track/status/:tracking_code',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    UNSUBSCRIBE: '/notifications/unsubscribe',
    RESUBSCRIBE: '/notifications/resubscribe',
    STATUS: '/notifications/status',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REPORTS: '/analytics/reports',
    EXPORT: '/analytics/export',
  },
  CLAIMS: {
    CREATE: '/claims',
    LIST: '/claims',
    GET: '/claims/:claim_id',
    UPLOAD_PHOTO: '/claims/:claim_id/photos',
    ADMIN_LIST_ALL: '/claims/admin/all',
    UPDATE_STATUS: '/claims/:claim_id/status',
  },
  QUOTES: {
    ESTIMATE: '/quotes/estimate',
    OPTIONS: '/quotes/options',
  },
  BILLING: {
    CREATE: '/billing',
    LIST: '/billing',
    CREATE_CHECKOUT_SESSION: '/billing/create-checkout-session',
    SESSION_STATUS: '/billing/session-status',
    GENERATE_REPORT: '/billing/reports/generate',
  },
  LABELS: {
    DOWNLOAD: '/labels/download/:shipment_id',
  },
  LOCATIONS: {
    DROPOFF_LOCATIONS: '/locations/dropoff',
    SEARCH_LOCATIONS: '/locations/search',
    GET_LOCATION: '/locations/:location_id',
    NEARBY_LOCATIONS: '/locations/nearby',
  },
  CONTACT: {
    SEND_MESSAGE: '/contact',
    GET_INFO: '/contact/info',
  },
  STATS: {
    ADMIN_DRIVER_STATS: '/stats/admin/driver/:driver_id',
    ADMIN_USER_STATS: '/stats/admin/user/:user_id',
    ADMIN_STATS: '/stats/admin',
    USER_STATS: '/stats/user',
  },
  DRIVER: {
    SEARCH_SHIPMENTS: '/driver/shipments/search',
    GET_SHIPMENT_BY_ID: '/driver/shipments/search/:shipment_id',
    UPDATE_SHIPMENT_STATUS: '/driver/shipments/:shipment_id/status',
    ASSIGNMENTS_TODAY: '/driver/assignments/today',
    ASSIGNMENTS_BY_DATE: '/driver/assignments/:assignment_date',
    UPLOAD_DELIVERY_PHOTO: '/driver/shipments/:shipment_id/delivery-photo',
    DRIVER_STATISTICS: '/stats/driver',
  },
  ROUTE_OPTIMIZATION: {
    GOOGLE_MAPS_ROUTE: '/route-optimization/driver/:driver_id/google-maps-route',
  },
  SHOPIFY: {
    // OAuth Endpoints
    INSTALL: '/shopify/auth/install',
    INSTALL_AUTHENTICATED: '/shopify/auth/install-authenticated',
    CALLBACK: '/shopify/auth/callback',
    DISCONNECT: '/shopify/auth/disconnect/:account_id',
    // Account Management
    ACCOUNTS: '/shopify/accounts',
    ACCOUNT_DETAILS: '/shopify/accounts/:account_id',
    ACCOUNT_SYNC: '/shopify/accounts/:account_id/sync',
    // Orders
    ORDERS: '/shopify/orders',
    // Stats
    STATS: '/shopify/stats',
    // Dashboard
    DASHBOARD_SUMMARY: '/shopify/dashboard/summary',
    DASHBOARD_ACTIVITY: '/shopify/dashboard/activity',
    DASHBOARD_ALERTS: '/shopify/dashboard/alerts',
    DASHBOARD_QUICK_STATS: '/shopify/dashboard/quick-stats',
    // Monitoring
    MONITORING_ERROR_METRICS: '/shopify/monitoring/errors/metrics',
    MONITORING_STORE_HEALTH: '/shopify/monitoring/health/stores',
    MONITORING_ERROR_TRENDS: '/shopify/monitoring/errors/trends',
    MONITORING_CRITICAL_ALERTS: '/shopify/monitoring/alerts/critical',
    MONITORING_HEALTH_SUMMARY: '/shopify/monitoring/health/summary',
    // Admin
    ADMIN_ACCOUNTS: '/shopify/admin/accounts',
    ADMIN_POLL: '/shopify/admin/poll',
    ADMIN_RETRY_FAILED: '/shopify/admin/retry-failed',
    ADMIN_SCHEDULER_STATUS: '/shopify/admin/scheduler/status',
    // Webhooks
    WEBHOOKS_ORDERS_CREATE: '/shopify/webhooks/orders/create',
    WEBHOOKS_TEST: '/shopify/webhooks/test',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;