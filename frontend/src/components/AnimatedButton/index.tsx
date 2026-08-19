import React from "react";

import { motion } from "motion/react";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    children,
    initial = { opacity: 0, x: 0 },
    animate = { opacity: 1, x: 0 },
    transition = { duration: 0.5 },
    whileHover = { scale: 1.02 },
    whileTap = { scale: 0.98 },
    ...props
}) => (
    <motion.div
        initial={initial}
        animate={animate}
        transition={transition}
        whileHover={whileHover}
        whileTap={whileTap}
        {...props}
    >
        {children}
    </motion.div>
);

export default AnimatedButton;
