"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "rounded-xl p-1.5 group-data-[orientation=horizontal]/tabs:h-11 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col shadow-inner backdrop-blur-md border border-white/5",
  {
    variants: {
      variant: {
        default: "bg-muted/50 dark:bg-muted/30",
        line: "gap-1 bg-transparent shadow-none border-none backdrop-blur-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/50 focus-visible:outline-[var(--primary)] text-foreground/70 hover:text-[var(--primary)] relative inline-flex h-full flex-1 items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ease-out group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-black/5 dark:data-[state=active]:ring-white/10",
        "data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--on-primary)] group-data-[variant=line]/tabs-list:data-[state=active]:!bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:!text-[var(--primary)]",
        "after:bg-[var(--primary)] after:absolute after:opacity-0 after:transition-all after:duration-300 group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-6px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=horizontal]/tabs:data-[state=active]:after:bottom-[-2px] group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
