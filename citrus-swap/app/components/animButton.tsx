import { motion } from 'framer-motion'
import React from 'react'

interface AnimButtonProps {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}

const AnimButton: React.FC<AnimButtonProps> = ({ onClick, children, disabled }) => {
  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        backgroundColor: '#FBBF24', // Example: a slightly different orange
        borderColor: '#4ADE80', // Example: a bright green for contrast
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`bg-primary hover:text-white text-white text-2xl md:text-3xl font-fred font-bold rounded-full px-6 py-2 w-1/2  shadow-xl cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

export default AnimButton
