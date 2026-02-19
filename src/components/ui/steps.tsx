import * as React from 'react'
import { cn } from "@/lib/utils"

interface StepsProps {
   currentStep: number
   children: React.ReactNode
   className?: string
}

interface StepProps {
   title: string
   description: string
}

export function Steps({ currentStep, children, className }: StepsProps) {
   const steps = React.Children.toArray(children)

   return (
      <div className={cn("space-y-4", className)}>
         <div className="relative flex justify-between">
            {steps.map((step, index) => (
               <div key={index} className="flex flex-col items-center">
                  <div
                     className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                        currentStep > index
                           ? "border-primary bg-primary text-primary-foreground"
                           : currentStep === index
                              ? "border-primary text-primary"
                              : "border-muted text-muted-foreground"
                     )}
                  >
                     {index + 1}
                  </div>
                  {React.isValidElement<StepProps>(step) && (
                     <div className="mt-2 text-center">
                        <div className="text-sm font-medium">{step.props.title}</div>
                        <div className="text-xs text-muted-foreground">
                           {step.props.description}
                        </div>
                     </div>
                  )}
               </div>
            ))}
            <div
               className="absolute top-4 left-0 -translate-y-1/2 h-[2px] bg-muted"
               style={{ width: '100%', zIndex: -1 }}
            />
            <div
               className="absolute top-4 left-0 -translate-y-1/2 h-[2px] bg-primary transition-all duration-500"
               style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, zIndex: -1 }}
            />
         </div>
      </div>
   )
}

export function Step({ title, description }: StepProps) {
   return null
}

