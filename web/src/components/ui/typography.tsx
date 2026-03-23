import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

export function Text({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("leading-7", className)} {...props} />
  )
}
