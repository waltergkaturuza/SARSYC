import { CollectionConfig } from 'payload/types'

const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'collection', 'user', 'createdAt'],
    description: 'System audit trail - tracks all changes made in the admin panel',
    group: 'System',
  },
  access: {
    read: ({ req }) => {
      // Only admins can read audit logs
      return req.user?.role === 'admin'
    },
    create: () => false, // Only created via hooks
    update: () => false, // Immutable
    delete: () => false, // Immutable
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Login', value: 'login' },
        { label: 'Logout', value: 'logout' },
        { label: 'Password Reset', value: 'password_reset' },
        { label: 'Account Locked', value: 'account_locked' },
        { label: 'Account Unlocked', value: 'account_unlocked' },
      ],
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
      admin: {
        description: 'The collection that was modified',
      },
    },
    {
      name: 'documentId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the document that was modified',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who performed the action',
      },
    },
    {
      name: 'userEmail',
      type: 'email',
      admin: {
        description: 'Email of the user (for quick reference)',
      },
    },
    {
      name: 'userRole',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
        { label: 'Speaker', value: 'speaker' },
        { label: 'Presenter', value: 'presenter' },
      ],
      admin: {
        description: 'Role of the user at the time of action',
      },
    },
    {
      name: 'changes',
      type: 'json',
      admin: {
        description: 'Detailed changes made (field-level diffs)',
      },
    },
    {
      name: 'before',
      type: 'json',
      admin: {
        description: 'Document state before the change',
      },
    },
    {
      name: 'after',
      type: 'json',
      admin: {
        description: 'Document state after the change',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the user',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'Browser/user agent information',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Human-readable description of the action',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata about the action',
      },
    },
  ],
  timestamps: true,
}

export default AuditLogs

