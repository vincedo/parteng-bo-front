export interface PartengHttpError {
  title: string; // "Forbidden"
  type: string; // "https://httpstatus.es/403"
  status: number; // 403
  detail: string; // "Entity validation error"
  errors: { [k: string]: any };
}
