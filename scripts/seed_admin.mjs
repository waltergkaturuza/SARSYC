export default async ({ payload }) => {
  const email = process.env.ADMIN_EMAIL || 'admin@local.test'
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'

  const existing = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    depth: 0,
  })

  if (existing.total > 0) {
    console.log('Admin user already exists:', email)
    return
  }

  const admin = await payload.create({
    collection: 'users',
    data: {
      email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      password,
    },
    overrideAccess: true,
  })

  // Write marker file so we can verify run completion in CI-less environments
  const { writeFile } = await import('fs/promises')
  await writeFile(new URL('./seed_admin.done', import.meta.url), `created:${admin.email}`)
}

