export interface ApiValidationError {
  fieldErrors: Record<string, string>
  summary: string
  errorCode: string
}
