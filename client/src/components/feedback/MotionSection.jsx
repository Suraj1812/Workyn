import { motion } from 'framer-motion';

const MotionSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    {children}
  </motion.div>
);

export default MotionSection;
