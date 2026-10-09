import React, { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalLoadingBar: React.FC = () => {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 inset-x-0 z-[9999] h-0.5 bg-gradient-maroon origin-left"
          style={{ transformOrigin: 'left' }}
        />
      )}
    </AnimatePresence>
  );
};
