/**

 * Login portal types — keep in sync with `src/payload/collections/Users.ts` role options.

 * "participant" is a portal entry for delegates (dashboard); it is not a Users.role value.

 */

export const USER_DATABASE_ROLES = [

  { value: 'admin', label: 'Admin' },

  { value: 'editor', label: 'Editor' },

  { value: 'accountant', label: 'Accountant' },

  { value: 'contributor', label: 'Contributor' },

  { value: 'speaker', label: 'Speaker' },

  { value: 'presenter', label: 'Presenter' },

  { value: 'reviewer', label: 'Reviewer' },

  { value: 'volunteer', label: 'Volunteer' },

] as const



export type UserDatabaseRole = (typeof USER_DATABASE_ROLES)[number]['value']



/** All selectable login portal types (database roles + participant delegate). */

export const LOGIN_PORTAL_TYPES = [

  {

    value: 'participant',

    label: 'Participant / Delegate',

    description: 'Conference registration and your personal dashboard',

    group: 'Conference',

  },

  ...USER_DATABASE_ROLES.map((r) => ({

    value: r.value,

    label: r.label,

    description: loginHintForRole(r.value),

    group: adminPanelRole(r.value) ? 'Administration' : 'Conference',

  })),

] as const



export type LoginPortalType = (typeof LOGIN_PORTAL_TYPES)[number]['value']



const PORTAL_VALUES = new Set(LOGIN_PORTAL_TYPES.map((t) => t.value))



export function parseLoginPortalType(value: string | null): LoginPortalType {

  if (value && PORTAL_VALUES.has(value as LoginPortalType)) {

    return value as LoginPortalType

  }

  return 'participant'

}



function adminPanelRole(role: string): boolean {

  return role === 'admin' || role === 'editor' || role === 'accountant'

}



function loginHintForRole(role: UserDatabaseRole): string {

  switch (role) {

    case 'admin':

      return 'Full admin panel (Payload CMS)'

    case 'editor':

      return 'Content and abstract management in admin'

    case 'accountant':

      return 'Registrations, Orathon, payments, donations and partnerships'

    case 'reviewer':

      return 'Review assigned abstracts'

    case 'speaker':

      return 'Speaker profile and session schedule'

    case 'presenter':

      return 'Abstract submissions and presentations'

    case 'contributor':

      return 'Contributions and submissions dashboard'

    case 'volunteer':

      return 'Volunteer information and updates'

    default:

      return 'Sign in to your account'

  }

}



export function portalTypeMeta(type: LoginPortalType) {

  return LOGIN_PORTAL_TYPES.find((t) => t.value === type) ?? LOGIN_PORTAL_TYPES[0]

}



/** API `type` field — admin panel roles share privileged login handling. */

export function loginApiType(type: LoginPortalType): string {

  return type

}



export function usesDirectLogin(type: LoginPortalType): boolean {

  return type === 'admin'

}



export function usesAdminPanelLogin(type: LoginPortalType): boolean {

  return type === 'admin' || type === 'editor' || type === 'accountant'

}



export function redirectAfterLogin(type: LoginPortalType): string {

  switch (type) {

    case 'admin':

      return '/admin'

    case 'editor':

      return '/admin/abstracts'

    case 'accountant':

      return '/admin/payments'

    case 'reviewer':

      return '/admin/abstracts'

    case 'speaker':

      return '/dashboard?type=speaker'

    case 'participant':

    case 'contributor':

    case 'presenter':

    case 'volunteer':

    default:

      return '/dashboard'

  }

}



export function loginNotice(type: LoginPortalType): string | null {

  switch (type) {

    case 'admin':

      return 'You will be redirected to the admin panel after login.'

    case 'editor':

      return 'Editors are redirected to the admin panel for content and abstract management.'

    case 'accountant':

      return 'Accountants are redirected to the finance section for registrations, Orathon, payments, and donations.'

    case 'reviewer':

      return 'You will be taken to your assigned abstracts to review.'

    default:

      return null

  }

}


