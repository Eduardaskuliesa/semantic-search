import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

interface SwipeableTabContentProps {
  activeTab: string;
  direction: number;
  variants: Variants;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  children: (tabKey: string) => ReactNode;
  tabs: string[];
}

export const SwipeableTabContent = ({
  activeTab,
  direction,
  variants,
  onTouchStart,
  onTouchEnd,
  children,
  tabs,
}: SwipeableTabContentProps) => (
  <div
    className="relative overflow-hidden"
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
  >
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      {tabs.map(
        (tab) =>
          activeTab === tab && (
            <motion.div
              key={tab}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children(tab)}
            </motion.div>
          )
      )}
    </AnimatePresence>
  </div>
);