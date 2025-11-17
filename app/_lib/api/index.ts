/** * Centralized API utilities for Next.js route handlers * Provides reusable functions for error handling, auth, caching, and more */ export {
  withErrorHandling,
  handleDuplicateKeyError,
} from "./error-handler";
export {
  withAuth,
  getAuthenticatedUser,
  unauthorized,
} from "./auth-middleware";
export {
  getETagVersion,
  setETagHeader,
  checkETagRequired,
  validateETag,
} from "./etag-helpers";
export {
  checkCacheByCount,
  checkCacheByETag,
  setCacheHeaders,
  notModifiedResponse,
} from "./cache-helpers";
export { parseJSON, safeParseJSON } from "./request-helpers";
export { formatUserPublic, formatBusinessPublic } from "./response-formatters";
