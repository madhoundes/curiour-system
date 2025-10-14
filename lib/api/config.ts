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
    ADMIN_ASSIGNMENTS_TODAY: '/admin/assignments/today',
    ADMIN_ASSIGNMENTS_BY_DATE: '/admin/assignments/:assignment_date',
    ADMIN_ASSIGNMENT_STATISTICS: '/admin/assignments/statistics/:assignment_date',
    ADMIN_REASSIGN_ASSIGNMENT: '/admin/assignments/:assignment_id/reassign',
    ADMIN_MANUAL_ASSIGNMENT: '/admin/assignments/manual',
    ADMIN_RUN_AUTOMATED_ASSIGNMENT: '/admin/assignments/run-automated',
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
    DELETE: '/shipments/:id',
    TRACK: '/shipments/:id/track',
    LABEL: '/shipments/:id/label',
    UPDATE_STATUS: '/shipments/:id/status',
    STATUS_HISTORY: '/shipments/:id/status-history',
    STATUS_DURATION: '/shipments/:id/status-duration/:status',
    BY_STATUS_DURATION: '/shipments/by-status-duration/:status',
    INITIALIZE_STATUS_TRACKING: '/shipments/initialize-status-tracking',
    ADMIN_MOVE_TO_WAREHOUSE: '/admin/shipments/move-to-warehouse',
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