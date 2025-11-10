import { ReactNode, isValidElement, ReactElement, cloneElement } from 'react'
import { Mail } from 'lucide-react'

type HowItWorksCardProps = {
  title: string
  description: string
  icon?: ReactNode
}

export function Card({ title, description, icon }: HowItWorksCardProps) {
  let renderedIcon: ReactNode = icon

  if (isValidElement(icon)) {
    renderedIcon = cloneElement(icon as ReactElement<any>, {
      className: `${(icon as ReactElement<any>).props.className ?? ''} transition-colors duration-300 group-hover:text-black`,
    })
  }

  return (
    <div className="group relative rounded-2xl w-full max-w-xs mx-auto overflow-hidden"> 

      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: 'linear-gradient(90deg,#CD01BA,#E20317)', opacity: 0.7 }}
      />

      <div className="relative rounded-2xl bg-[#F7F0FF] border border-[#D6C2FF] p-3 sm:p-4 text-center transition-all duration-300 group-hover:bg-transparent group-hover:border-transparent">
        
        <div 
          className="pointer-events-none absolute inset-[1px] rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.9)' }} 
        />

        {/* Inner Content */}
        <div className="relative flex flex-col items-center justify-center py-3 sm:py-4 z-10">
          {/* Outer Circle */}
          <div className="grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white transition-colors duration-300">
            {/* Inner Circle */}
            <div className="grid place-items-center h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-[#F3E7FF] transition-transform duration-300 group-hover:scale-[1.05]">
              {renderedIcon ?? (
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-[#6B21A8] transition-colors duration-300 group-hover:text-black" />
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-[#1F1147] transition-colors duration-300 group-hover:text-white mt-2">
            {title}
          </h3>

          {/* Description */}
          <p className="max-w-[28ch] text-xs sm:text-sm leading-4 sm:leading-5 text-[#4A3A7A] transition-colors duration-300 group-hover:text-white mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
