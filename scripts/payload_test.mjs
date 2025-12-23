export default async ({ payload }) => {
  console.log('payload available:', !!payload)
  const info = await payload.findVersions ? 'has findVersions' : 'no findVersions'
  console.log('payload info:', info)
}
