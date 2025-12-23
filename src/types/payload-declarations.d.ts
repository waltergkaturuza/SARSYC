declare module 'payload/types' {
  /**
   * Simplified type declarations for Payload types used across the project.
   * These are intentionally broad (any) to avoid hard dependency on payload's internal
   * typings across different payload versions during build-time.
   */
  export type CollectionConfig = any
  export type GlobalConfig = any
  export type Payload = any
  export type Access = any
  export type Field = any
  export type Block = any
  export * from 'payload'
}
