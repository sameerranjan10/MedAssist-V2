import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"

export default function DockNav({ items, className }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [hovered, setHovered] = React.useState(null)

  return (
    <div className={cn("flex items-center justify-center w-full pb-4 pt-2", className)}>
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "flex items-end gap-2 px-3 py-2 rounded-3xl",
          "border bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-lg border-slate-200 dark:border-slate-800",
          "overflow-x-auto no-scrollbar max-w-[95vw]"
        )}
        style={{
          transform: "perspective(600px) rotateX(10deg)", // arc layout illusion
        }}
      >
        <TooltipProvider delayDuration={100}>
          {items.map((item, i) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/'))
            const isHovered = hovered === i

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <motion.div
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    animate={{
                      scale: isHovered ? 1.2 : 1,
                      rotate: isHovered ? -5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex flex-col items-center flex-shrink-0"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-2xl relative transition-colors h-12 w-12",
                        isHovered && "shadow-lg shadow-brand/20",
                        isActive && "bg-brand/10"
                      )}
                      onClick={() => {
                        navigate(item.to)
                      }}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 transition-colors",
                          isActive ? "text-brand" : "text-slate-500 dark:text-slate-400"
                        )}
                      />
                      {/* Glowing ring effect */}
                      {isHovered && (
                        <motion.span
                          layoutId="glow"
                          className="absolute inset-0 rounded-2xl border border-brand/40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </Button>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="dot"
                        className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-brand"
                      />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </motion.div>
    </div>
  )
}
