import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type FeedbackType = 
  | 'cardPlaced'
  | 'pass'
  | 'press'
  | 'goal'
  | 'save'
  | 'miss'
  | 'error';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  message: string;
  timestamp: number;
}

interface FeedbackOverlayProps {
  messages: FeedbackMessage[];
  onMessageExpire: (id: string) => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  messages,
  onMessageExpire,
}) => {
  useEffect(() => {
    messages.forEach(msg => {
      const timer = setTimeout(() => {
        onMessageExpire(msg.id);
      }, 2000);
      return () => clearTimeout(timer);
    });
  }, [messages, onMessageExpire]);

  const getFeedbackStyle = (type: FeedbackType) => {
    switch (type) {
      case 'cardPlaced':
        return {
          icon: '✓',
          color: 'from-green-500 to-green-600',
          scale: 1.0
        };
      case 'pass':
        return {
          icon: '📤',
          color: 'from-blue-500 to-blue-600',
          scale: 1.2
        };
      case 'press':
        return {
          icon: '⬆️',
          color: 'from-red-500 to-red-600',
          scale: 1.2
        };
      case 'goal':
        return {
          icon: '⚽',
          color: 'from-yellow-400 to-orange-500',
          scale: 2.0
        };
      case 'save':
        return {
          icon: '🧤',
          color: 'from-blue-500 to-blue-700',
          scale: 1.5
        };
      case 'miss':
        return {
          icon: '❌',
          color: 'from-gray-500 to-gray-600',
          scale: 1.2
        };
      case 'error':
        return {
          icon: '⚠️',
          color: 'from-red-600 to-red-700',
          scale: 1.0
        };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center">
      <AnimatePresence>
        {messages.map((msg, index) => {
          const style = getFeedbackStyle(msg.type);
          
          return (
            <div key={msg.id} className="relative">
              {/* Main Feedback Message */}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  scale: 0.5,
                  y: 0,
                  rotate: msg.type === 'goal' ? -10 : 0
                }}
                animate={{ 
                  opacity: 1, 
                  scale: style.scale,
                  y: -50 * index,
                  rotate: msg.type === 'goal' ? 0 : 0,
                  filter: [
                    'drop-shadow(0 0 20px rgba(255,255,255,0.8))',
                    'drop-shadow(0 0 40px rgba(255,255,255,1))',
                    'drop-shadow(0 0 30px rgba(255,255,255,0.6))'
                  ]
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.5,
                  y: -100,
                  rotate: msg.type === 'goal' ? 10 : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className={`
                  absolute
                  bg-gradient-to-br ${style.color}
                  text-white font-black text-2xl
                  px-8 py-4 rounded-2xl
                  shadow-2xl border-4 border-white/30
                  flex items-center gap-4
                  transform-style-3d
                `}
              >
                <motion.span 
                  className="text-4xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: 2,
                    repeatDelay: 0.2
                  }}
                >
                  {style.icon}
                </motion.span>
                <motion.span
                  animate={{ 
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: 2,
                    repeatDelay: 0.2
                  }}
                >
                  {msg.message}
                </motion.span>
              </motion.div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing feedback messages
export const useFeedback = () => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = (type: FeedbackType, message: string) => {
    const newMessage: FeedbackMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const removeFeedback = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return {
    messages,
    showFeedback,
    removeFeedback
  };
};
