import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeatureTooltip({ 
  id, 
  title, 
  description, 
  position = 'bottom',
  show = true,
  onDismiss 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this tooltip has been dismissed before
    const dismissed = localStorage.getItem(`tooltip_dismissed_${id}`);
    if (!dismissed && show) {
      // Show with a slight delay
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [id, show]);

  const handleDismiss = () => {
    localStorage.setItem(`tooltip_dismissed_${id}`, 'true');
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -10 : 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`absolute ${positionClasses[position]} z-50 w-80`}
      >
        <Card className="p-4 shadow-xl border-2 border-[#FF5124] bg-white">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-[#FF5124]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="rounded-full flex-shrink-0 -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Arrow */}
        <div
          className={`absolute ${
            position === 'bottom'
              ? '-top-2 left-4'
              : position === 'top'
              ? '-bottom-2 left-4'
              : position === 'left'
              ? '-right-2 top-4'
              : '-left-2 top-4'
          }`}
        >
          <div
            className={`w-4 h-4 bg-white border-[#FF5124] transform rotate-45 ${
              position === 'bottom'
                ? 'border-t-2 border-l-2'
                : position === 'top'
                ? 'border-b-2 border-r-2'
                : position === 'left'
                ? 'border-t-2 border-r-2'
                : 'border-b-2 border-l-2'
            }`}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}