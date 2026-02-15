import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard } from '../data/cards';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';

interface TutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  currentStep: number;
  onNextStep: () => void;
  onComplete: () => void;
  onStepComplete: (stepId: string) => void;
  gameState?: any;
  playerHand?: PlayerCard[];
  onTestFunctionality?: (testName: string, result: boolean) => void;
}

export const TutorialGuide: React.FC<TutorialGuideProps> = ({
  isOpen,
  onClose,
  onSkip,
  currentStep,
  onNextStep,
  onComplete,
  onStepComplete,
  gameState,
  playerHand = [],
  onTestFunctionality
}) => {
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];

  if (!isOpen || currentStep >= TUTORIAL_STEPS.length) {
    return null;
  }

  const handleStepComplete = useCallback(() => {
    if (!currentTutorialStep) return;
    
    const stepId = currentTutorialStep.id;
    
    // 执行功能测试
    const testResults = onTestFunctionality ? onTestFunctionality(stepId, true) : true;
    
    setCompletedSteps(prev => new Set(prev).add(stepId));
    onStepComplete(stepId);
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setShowCongratulations(true);
      setTimeout(() => {
        setShowCongratulations(false);
        if (onNextStep) {
          onNextStep();
        }
      }, 2000);
    } else {
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentStep, currentTutorialStep, onStepComplete, onNextStep, onComplete, onTestFunctionality]);

  const handleNextStep = useCallback(() => {
    setShowCongratulations(false);
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      onNextStep();
    }
  }, [currentStep, onNextStep]);

  const handleSkipAll = useCallback(() => {
    onSkip();
  }, [onSkip]);

  if (!isOpen || !currentTutorialStep) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl mx-4">
        {/* 模态框背景 */}
        <div className="absolute inset-0 bg-black/80" />
        
        {/* 主引导窗口 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gray-900 border-2 border-gray-700 rounded-2xl p-8 max-h-[80vh] overflow-y-auto"
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-white mb-4">{currentTutorialStep.title}</h2>

          {/* 描述 */}
          <p className="text-gray-300 mb-6">{currentTutorialStep.description}</p>

          {/* 可视化提示 */}
          {currentTutorialStep.targetElement && (
            <div className="mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-600">
                <p className="text-sm text-gray-400 mb-2">提示：</p>
                <p className="text-gray-300">
                  寻找元素: <code className="text-yellow-400">{currentTutorialStep.targetElement}</code>
                </p>
              </div>
            </div>
          )}

          {/* 恭喜信息 */}
          <AnimatePresence>
            {showCongratulations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-500"
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-2xl">🎉</span>
                  <span className="text-green-100 font-bold">太棒了！</span>
                </div>
                <p className="text-green-200 mt-2">
                  你已经完成了这一关！准备进入下一关指导...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>进度: {currentStep + 1} / {TUTORIAL_STEPS.length}</span>
              <span>{Math.round(((currentStep + 1) / TUTORIAL_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 步骤列表 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">教程步骤</h3>
            <div className="space-y-2">
              {TUTORIAL_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index === currentStep
                      ? 'bg-blue-900/50 border-2 border-blue-500'
                      : index < currentStep
                      ? 'bg-green-900/30 border border-green-600'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep
                      ? 'bg-green-600'
                      : index === currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-600'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      index === currentStep ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleSkipAll}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              跳过教程
            </button>
            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleStepComplete}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                完成教程
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
