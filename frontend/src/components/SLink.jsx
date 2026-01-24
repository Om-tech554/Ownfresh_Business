import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

const SLink = ({ to, children, className = "" }) => {
  return (
    <MotionLink
      to={to}
      className={className}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}  // smooth professional hover
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </MotionLink>
  );
};

export default SLink;
