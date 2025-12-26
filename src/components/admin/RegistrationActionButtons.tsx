'use client'

import { ApproveButton, RejectButton } from '@/components/admin/RegistrationActions'

interface RegistrationActionButtonsProps {
  registrationId: string
  status: string
  adminId?: string
}

export default function RegistrationActionButtons({ 
  registrationId, 
  status,
  adminId = '' 
}: RegistrationActionButtonsProps) {
  return (
    <div className="flex gap-3">
      {status !== 'confirmed' && (
        <ApproveButton registrationId={registrationId} adminId={adminId} />
      )}
      {status !== 'cancelled' && (
        <RejectButton registrationId={registrationId} adminId={adminId} />
      )}
    </div>
  )
}

