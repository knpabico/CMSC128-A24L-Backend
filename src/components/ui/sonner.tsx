"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      {...props}
    />
  )
}

const toastSuccess = (description: string) => {
  toast.error("Success!", {
    description: description,
    style: {
      backgroundColor: "#16a34a",
      color: "white",
      borderColor: "#16a34a",
    },
  });
};

const toastError = (description: string) => {
  toast.error("Error!", {
    description: description,
    style: {
      backgroundColor: "#dc2626",
      color: "white",
      borderColor: "#dc2626",
    },
  });
};

export { Toaster, toastSuccess, toastError }
