/**
 * Toast notification utilities
 * Provides consistent toast messages across the application
 */

import toast from 'react-hot-toast'

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
    })
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
    })
  },
  
  loading: (message: string) => {
    return toast.loading(message)
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        success: {
          duration: 4000,
        },
        error: {
          duration: 5000,
        },
      }
    )
  },
  
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 4000,
    })
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId)
  },
}



