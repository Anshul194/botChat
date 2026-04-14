import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/20 flex field-sizing-content min-h-[5rem] w-full rounded-xl border bg-transparent px-4 py-3 text-base shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 outline-none hover:border-primary/40 focus-visible:border-primary focus-visible:ring-[4px] focus-visible:ring-primary/20 focus-visible:shadow-[0_0_15px_rgba(236,72,153,0.15)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
