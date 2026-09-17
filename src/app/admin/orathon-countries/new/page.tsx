import OrathonCountryForm from '@/components/admin/forms/OrathonCountryForm'

export default function NewOrathonCountryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Orathon country</h1>
        <p className="text-gray-600 mt-1">
          Add a registration link and optional flyer for a country
        </p>
      </div>
      <OrathonCountryForm mode="create" />
    </div>
  )
}
