declare module 'payload/config' {
  export function buildConfig(cfg: any): any
}

declare module 'payload' {
  const payload: any
  export default payload
  export type Payload = any
}

declare module '@payloadcms/db-mongodb' {
  export function mongooseAdapter(options: any): any
}

declare module '@payloadcms/bundler-webpack' {
  export function webpackBundler(options?: any): any
}

declare module '@payloadcms/richtext-slate' {
  export function slateEditor(options?: any): any
}
