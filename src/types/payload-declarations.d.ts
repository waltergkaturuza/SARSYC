declare module 'payload' {
  // Minimal ambient declarations for types and helpers we use in the project.
  // Keep these broad to avoid hard coupling to payload's internal types across versions.
  export type CollectionConfig = any
  export type GlobalConfig = any
  export type Payload = any
  export type Access = any
  export type Field = any
  export type Block = any

  // Build helpers
  export function buildConfig(config: any): Promise<any>

  // Default runtime export
  const payload: any
  export default payload
}

declare module 'payload/types' {
  export type CollectionConfig = any
  export type GlobalConfig = any
  export type Payload = any
  export type Access = any
  export type Field = any
  export type Block = any
}
