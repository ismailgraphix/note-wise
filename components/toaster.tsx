"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast 
          key={id} 
          {...props}
          className="w-[90vw] md:w-[420px] bg-background"
        >
          <div className="grid gap-1">
            {title && <ToastTitle className="text-sm md:text-base">{title}</ToastTitle>}
            {description && (
              <ToastDescription className="text-xs md:text-sm">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="h-4 w-4 md:h-5 md:w-5" />
        </Toast>
      ))}
      <ToastViewport className="flex flex-col gap-2 p-4 md:p-6 fixed bottom-0 right-0 top-auto left-auto sm:top-auto sm:right-0 sm:bottom-0 w-full md:w-[420px] list-none z-[100] outline-none" />
    </ToastProvider>
  )
}

