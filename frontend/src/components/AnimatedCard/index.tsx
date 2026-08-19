import React from "react";

import { motion } from "motion/react";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
    (
        {
            children,
            initial = { opacity: 0, y: 20 },
            animate = { opacity: 1, y: 0 },
            transition = { duration: 0.4 },
            whileHover,
            className,
            ...props
        },
        ref
    ) => (
        <motion.div
            ref={ref}
            initial={initial}
            animate={animate}
            transition={transition}
            {...(whileHover && { whileHover })}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
);

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;
