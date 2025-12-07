// lib/clerkAppearance.ts
type Appearance = Record<string, any>;

// Dark theme appearance
export const clerkAppearanceDark: Appearance = {
  variables: {
    colorPrimary: "hsl(334 100% 41%)",
    colorBackground: "#000000",
    colorInputBackground: "#1a1a1a",
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1aa",
    colorInputText: "#ffffff",
    colorDanger: "#ef4444",
    borderRadius: "0.75rem",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  },
  layout: {
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
  },
  elements: {
    rootBox: "w-full flex justify-center items-center min-h-screen px-4",
    card: "w-full max-w-md rounded-2xl border-2 border-white/20 bg-black shadow-2xl shadow-white/10 p-6 space-y-6",
    headerTitle: "text-2xl font-semibold tracking-tight text-white",
    headerSubtitle: "text-sm text-gray-300",
    form: "space-y-4",
    formField: "space-y-2",
    formFieldLabel: "text-sm font-medium leading-none text-white",
    formFieldInput: "w-full rounded-md border border-gray-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-gray-500",
    formFieldError: "text-xs text-red-400 mt-1",
    socialButtons: "flex flex-col gap-2",
    socialButtonsIconButton: {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      borderRadius: "0.375rem",
      border: "1.5px solid rgba(255, 255, 255, 0.3)",
      backgroundColor: "#18181b",
      padding: "0.5rem 0.75rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#ffffff",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "#27272a",
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
    },
    socialButtonsBlockButton: {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      borderRadius: "0.375rem",
      border: "1.5px solid rgba(255, 255, 255, 0.3)",
      backgroundColor: "#18181b",
      padding: "0.5rem 0.75rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#ffffff",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "#27272a",
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#ffffff",
      fontWeight: "500",
    },
    formButtonPrimary: "w-full inline-flex items-center justify-center rounded-md bg-pink-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-pink-700 transition-colors",
    footer: "text-sm text-gray-300 flex items-center justify-center gap-1",
    footerActionLink: "font-medium text-pink-500 hover:underline",
    dividerText: "text-gray-400",
    dividerLine: "bg-gray-700",
  },
};

// Light theme appearance
export const clerkAppearanceLight: Appearance = {
  variables: {
    colorPrimary: "hsl(334 100% 41%)",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorText: "#000000",
    colorTextSecondary: "#71717a",
    colorInputText: "#000000",
    colorDanger: "#dc2626",
    borderRadius: "0.75rem",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
  },
  layout: {
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
  },
  elements: {
    rootBox: "w-full flex justify-center items-center min-h-screen px-4",
    card: "w-full max-w-md rounded-2xl border-3 border-pink-600 bg-white shadow-lg p-6 space-y-6",
    headerTitle: "text-2xl font-semibold tracking-tight text-black",
    headerSubtitle: "text-sm text-gray-600",
    form: "space-y-4",
    formField: "space-y-2",
    formFieldLabel: "text-sm font-medium leading-none text-black",
    formFieldInput: "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500",
    formFieldError: "text-xs text-red-600 mt-1",
    socialButtons: "flex flex-col gap-2",
    socialButtonsIconButton: "w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 transition-colors",
    formButtonPrimary: "w-full inline-flex items-center justify-center rounded-md bg-pink-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-pink-700 transition-colors",
    footer: "text-sm text-gray-600 flex items-center justify-center gap-1",
    footerActionLink: "font-medium text-pink-600 hover:underline",
    dividerText: "text-gray-500",
    dividerLine: "bg-gray-300",
  },
};

// Default export that uses theme detection
export const clerkAppearance = clerkAppearanceDark;