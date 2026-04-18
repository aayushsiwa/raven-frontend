import { motion } from 'framer-motion'

export function AnimatedSkeleton({ 
  className = '',
  variant = 'rect'
}: { 
  className?: string
  variant?: 'rect' | 'text' | 'circle'
}) {
  const baseClasses = {
    rect: 'rounded-lg',
    text: 'rounded h-4',
    circle: 'rounded-full'
  }

  return (
    <motion.div
      className={`bg-slate-200/60 ${baseClasses[variant]} ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl bg-white/80 p-4 border border-slate-200/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <AnimatedSkeleton className="h-3 w-12" />
            <AnimatedSkeleton className="h-3 w-8" />
            <AnimatedSkeleton className="h-3 w-20" />
          </div>
          <AnimatedSkeleton className="h-5 w-full mb-2" />
          <AnimatedSkeleton className="h-4 w-full mb-1" />
          <AnimatedSkeleton className="h-4 w-5/6 mb-3" />
          <AnimatedSkeleton className="h-4 w-24" />
        </motion.div>
      ))}
    </div>
  )
}

export function InterestPickerSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.15 }}
          className="rounded-lg border border-slate-200/50 p-3"
        >
          <AnimatedSkeleton className="h-5 w-24 mb-2" />
          <div className="flex flex-wrap gap-2">
            <AnimatedSkeleton className="h-6 w-16" />
            <AnimatedSkeleton className="h-6 w-20" />
            <AnimatedSkeleton className="h-6 w-12" />
            <AnimatedSkeleton className="h-6 w-18" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}