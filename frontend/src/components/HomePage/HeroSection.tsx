import { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { NavigateFunction } from "react-router-dom";
import { Button } from "../ui/button";
import {
  jobArray,
  resumeArray,
  linkedInProfiles,
} from "../../assets/dummyData";
import JobCard from "../jobs/JobCard";
import ResumeComparison from "../ResumeV2/ResumeComparision";
import { LinkedInProfileCard } from "../JobPage/HiringManagerSection";

interface HeroSectionProps {
  navigate: NavigateFunction;
}

// Enhanced animated title component with letter-by-letter animation
const AnimatedSectionTitle = ({ children }: { children: React.ReactNode }) => {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.3 });

  const text = Array.isArray(children) ? children.join(" ") : String(children);

  // Split into words for layout, then into characters for animation
  const words = text.split(" ");

  return (
    <h3
      ref={titleRef}
      className="text-center text-2xl md:text-3xl font-bold mb-8 overflow-hidden"
    >
      <div className="flex flex-wrap justify-center gap-x-2 relative">
        {words.map((word, i) => (
          <div key={`word-${i}`} className="overflow-hidden">
            <div className="flex">
              {word.split("").map((char, charIndex) => (
                <motion.span
                  key={`char-${i}-${charIndex}`}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500"
                  initial={{ y: 50, opacity: 0 }}
                  animate={
                    isInView
                      ? {
                          y: 0,
                          opacity: 1,
                          transition: {
                            duration: 0.5,
                            delay: i * 0.04 + charIndex * 0.01,
                            ease: [0.2, 0.65, 0.3, 0.9],
                          },
                        }
                      : {}
                  }
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </h3>
  );
};

// Enhanced background shapes with parallax effect
const BackgroundShapes = () => {
  const shapesRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: shapesRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div
      ref={shapesRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      <motion.div
        style={{ y: y1 }}
        className="absolute top-0 -left-10 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob"
      ></motion.div>
      <motion.div
        style={{ y: y2 }}
        className="absolute top-0 -right-10 w-72 h-72 bg-indigo-50 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000"
      ></motion.div>
      <motion.div
        style={{ y: y3 }}
        className="absolute top-64 left-48 w-72 h-72 bg-purple-50 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-4000"
      ></motion.div>
      <motion.div
        style={{ y: y1 }}
        className="absolute -bottom-10 left-20 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob"
      ></motion.div>
      <motion.div
        style={{ y: y2 }}
        className="absolute -bottom-10 right-20 w-72 h-72 bg-indigo-50 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000"
      ></motion.div>

      {/* Add subtle floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1 w-1 rounded-full bg-blue-400/30"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [null, "-20%", "20%"],
              x: [null, "10%", "-10%"],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced feature section with staggered animations
const FeatureSection = ({
  title,
  children,
  animationProps,
  variant = "default",
}: {
  title: string;
  children: React.ReactNode;
  animationProps:
    | {
        opacity: MotionValue<number>;
        y: MotionValue<number>;
        scale: MotionValue<number>;
      }
    | {};
  variant?: "default" | "alternate";
}) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const bgClass =
    variant === "alternate"
      ? "bg-gradient-to-br from-blue-50/60 to-indigo-50/60 backdrop-blur-sm border border-blue-100/40 rounded-2xl shadow-lg"
      : "";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
        delayChildren: 0.01,
        duration: 0.05,
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      className={`w-full flex justify-center px-6 py-20 flex-col items-center gap-10 max-w-7xl mx-auto ${bgClass} relative overflow-hidden`}
      style={animationProps}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Animated decorative elements for sections */}
      {variant === "alternate" && (
        <>
          <motion.div
            className="absolute top-10 right-10 w-32 h-32 bg-blue-400/5 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-40 h-40 bg-indigo-400/5 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </>
      )}

      <AnimatedSectionTitle>{title}</AnimatedSectionTitle>
      {children}
    </motion.section>
  );
};

// Enhanced animated counter with easing
const useAnimatedCounter = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(counterRef, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;
    let lastUpdate = 0;
    const throttleDelay = 50; // Only update the UI every 50ms on mobile

    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Only update the state if enough time has passed since last update
      // This reduces the number of re-renders
      if (timestamp - lastUpdate >= throttleDelay || percentage === 1) {
        // Apply easing function for more natural animation
        const easedProgress = easeOutQuart(percentage);
        setCount(Math.floor(easedProgress * end));
        lastUpdate = timestamp;
      }

      if (progress < duration) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return { count, ref: counterRef };
};

// Shimmering effect component
const ShimmerEffect = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <motion.div
      className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
      animate={{ x: ["200%", "-200%"] }}
      transition={{
        repeat: Infinity,
        duration: 2.5,
        ease: "linear",
        repeatDelay: 0.5,
      }}
    />
  </div>
);

const HeroSection = ({ navigate }: HeroSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Enhanced transform values for richer animations
  const imageOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const imageScale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);
  const imageY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  // Background effects based on scroll
  const gradientOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 0.25]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const animationProps = {
    opacity: imageOpacity,
    y: imageY,
    scale: imageScale,
  };

  const fastImageOpacity = useTransform(
    scrollYProgress,
    [0, 0.15], // Earlier trigger point
    [0.4, 1], // Start at 40% opacity for faster initial visibility
  );

  const fastImageScale = useTransform(
    scrollYProgress,
    [0, 0.15],
    [0.98, 1], // Less dramatic scale effect
  );

  const fastImageY = useTransform(
    scrollYProgress,
    [0, 0.15],
    [25, 0], // Smaller y-offset
  );

  // Combined animation props for simpler usage
  const fastAnimationProps = {
    opacity: fastImageOpacity,
    y: fastImageY,
    scale: fastImageScale,
  };

  // Animated user count
  const { count: userCount, ref: counterRef } = useAnimatedCounter(15000);

  // Selected jobs for display with memoization to avoid unnecessary re-renders
  const selectedJobs = useMemo(() => jobArray.slice(0, 3), []);
  const selectedProfiles = useMemo(() => linkedInProfiles, []);

  const isMobile = window.innerWidth < 768;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-white via-white to-blue-50/30"
    >
      {/* Enhanced animated background with parallax */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 pointer-events-none z-0"
        style={{ opacity: gradientOpacity, y: parallaxY }}
        aria-hidden="true"
      />

      <BackgroundShapes />

      <header
        className="container mx-auto px-4 text-center flex flex-col items-center justify-center min-h-screen relative z-10"
        id="hero"
      >
        <motion.div
          className="max-w-4xl mx-auto flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-row gap-6">
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-violet-50 to-gray-50 border border-violet-200 rounded-full px-5 py-2 mb-8 shadow-sm"
              role="status"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 },
              }}
            >
              <span className="flex h-2 w-2 mr-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <p className="text-violet-800 text-xs md:text-sm font-medium group-hover:text-yellow-900">
                Just Launched • Beta (v1.0)
              </p>
              <ShimmerEffect className="rounded-full" />
            </motion.div>

            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-violet-50 to-gray-50 border border-violet-200 rounded-full px-5 py-2 mb-8 shadow-sm"
              role="status"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 },
              }}
            >
              <span className="flex h-2 w-2 mr-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <p className="text-violet-800 text-xs md:text-sm font-medium group-hover:text-yellow-900">
                Free to use (Launch offer only)
              </p>
              <ShimmerEffect className="rounded-full" />
            </motion.div>
          </div>
          {/* Enhanced main title with text reveal animation */}
          <div className="relative mb-6 md:mb-8">
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight relative"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-10"
                />
                Your Dream Job Is <br className="md:hidden" />
                <motion.span
                  className="text-blue-600 relative inline-block"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  One Connection Away
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-400/60 rounded-full"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  />
                </motion.span>
              </motion.h1>
            </motion.div>
          </div>

          <motion.h2
            className="text-3xl md:text-5xl font-black mb-8 md:mb-10 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 text-transparent bg-clip-text relative inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            AI-Powered Job Search & Networking
            <ShimmerEffect />
          </motion.h2>

          <motion.p
            className="text-xl md:text-xl mb-10 md:mb-12 max-w-2xl mx-auto text-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Land interviews faster with personalized job matches, AI-crafted
            resumes, and warm introductions to industry insiders - all in under
            60 seconds.
          </motion.p>

          <motion.div
            className="flex flex-col gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Enhanced CTA button with hover effects */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={() => navigate("/jobs")}
                variant="Ethereal Jobs"
                size="lg"
                className="relative overflow-hidden rounded-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl border border-blue-400/20"
              >
                <span className="mr-2 relative z-10">Launch Your Career</span>
                <motion.span
                  className="relative z-10 inline-flex items-center"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg
                    className="w-5 h-5 inline-block"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.span>
                <ShimmerEffect />
              </Button>
            </motion.div>

            <p className="text-sm text-gray-600 flex items-center gap-2">
              Join{" "}
              <span ref={counterRef} className="font-semibold text-blue-600">
                {userCount.toLocaleString()}+
              </span>{" "}
              successful job seekers
            </p>
          </motion.div>
        </motion.div>
      </header>

      <main className="container mx-auto relative z-10" id="features">
        <FeatureSection
          title="Discover Perfect-Match Opportunities with AI"
          animationProps={isMobile ? {} : fastAnimationProps}
          variant="alternate"
        >
          <motion.div
            className="w-full max-w-6xl flex flex-col md:flex-row gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-full rounded-xl overflow-hidden flex flex-col md:flex-row gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div
                className="w-full rounded-xl overflow-hidden flex flex-col gap-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {selectedJobs.map((job, index) => (
                  <motion.div
                    key={`job-${index}`}
                    className="relative"
                    initial={{ opacity: 0, x: -20, scale: 0.98 }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: { delay: index * 0.1, duration: 0.4 },
                    }}
                    whileHover={{
                      y: -5,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      transition: { duration: 0.2 },
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <JobCard job={job} redirect={false} />
                    {/* Add subtle highlight effect on hover */}
                    <motion.div
                      className="absolute inset-0 border-2 border-blue-400/0 rounded-xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{
                        opacity: 1,
                        borderColor: "rgba(96, 165, 250, 0.5)",
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.h4
                className="text-lg font-semibold text-gray-800 mb-3"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                viewport={{ once: true }}
              >
                How it works
              </motion.h4>
              <motion.ul
                className="space-y-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <li>
                  <span className="font-semibold text-blue-600">Step 1:</span>{" "}
                  Enter your job preferences and upload your resume
                </li>
                <li>
                  <span className="font-semibold text-blue-600">Step 2:</span>{" "}
                  Get matched with personalized job listings
                </li>
              </motion.ul>

              <motion.div
                className="mt-4 pt-4 border-t border-blue-100"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <h5 className="font-semibold text-gray-800 mb-2">
                  Understanding your match:
                </h5>
                <ul className="space-y-2 text-sm">
                  <motion.li
                    className="flex flex-col sm:flex-row items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-blue-600 font-medium mr-2 w-36 flex-shrink-0">
                      • Match Score:
                    </span>
                    <span className="flex-1">
                      Overall compatibility between your resume and job
                      requirements
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex flex-col sm:flex-row items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-blue-600 font-medium mr-2 w-36 flex-shrink-0">
                      • Keywords:
                    </span>
                    <span className="flex-1">
                      Important terms from your resume that match job
                      description
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex flex-col sm:flex-row items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-blue-600 font-medium mr-2 w-36 flex-shrink-0">
                      • Content:
                    </span>
                    <span className="flex-1">
                      How well your experience aligns with job responsibilities
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex flex-col sm:flex-row items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-blue-600 font-medium mr-2 w-36 flex-shrink-0">
                      • Skills:
                    </span>
                    <span className="flex-1">
                      Technical abilities that match job requirements
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex flex-col sm:flex-row items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-blue-600 font-medium mr-2 w-36 flex-shrink-0">
                      • Experience:
                    </span>
                    <span className="flex-1">
                      How your work history aligns with job expectations
                    </span>
                  </motion.li>
                </ul>
              </motion.div>

              <motion.div
                className="mt-4 pt-4 border-t border-blue-100"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                viewport={{ once: true }}
              >
                <h5 className="font-semibold text-gray-800 mb-2">
                  Technology tags:
                </h5>
                <p className="text-sm mb-2">
                  Green tags highlight skills from your resume that match job
                  requirements.
                </p>
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  viewport={{ once: true }}
                >
                  <motion.span
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.3 }}
                    viewport={{ once: true }}
                  >
                    JavaScript
                  </motion.span>
                  <motion.span
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                    viewport={{ once: true }}
                  >
                    React
                  </motion.span>
                  <motion.span
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.5 }}
                    viewport={{ once: true }}
                  >
                    TypeScript
                  </motion.span>
                  <motion.span
                    className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.6 }}
                    viewport={{ once: true }}
                  >
                    GraphQL
                  </motion.span>
                  <motion.span
                    className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.7 }}
                    viewport={{ once: true }}
                  >
                    AWS
                  </motion.span>
                </motion.div>
                <motion.p
                  className="text-xs mt-2 text-gray-600"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.8 }}
                  viewport={{ once: true }}
                >
                  Gray tags indicate skills required by the job that weren't
                  found in your resume.
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </FeatureSection>

        <div id="resume">
          <FeatureSection
            title="Generate Tailored Resumes That Stand Out"
            animationProps={animationProps}
          >
            <div className="w-full max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  transition: { duration: 0.3 },
                }}
                viewport={{ once: true, margin: "-50px" }}
                className="shadow-2xl rounded-xl overflow-hidden border border-blue-100/50 relative"
              >
                {/* Add decorative elements */}
                <motion.div
                  className="absolute -top-8 -right-8 w-16 h-16 bg-blue-50 rounded-full opacity-70"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                />
                <motion.div
                  className="absolute -bottom-8 -left-8 w-16 h-16 bg-indigo-50 rounded-full opacity-70"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  viewport={{ once: true }}
                />

                <ResumeComparison
                  name="Aaron Jevil Nazareth"
                  optimizedResume={resumeArray[0]}
                  originalResume={resumeArray[1]}
                  showGeneratedResume={true}
                  startResumeGeneration={(_regenerate?: boolean) =>
                    Promise.resolve()
                  }
                  updateResumeSection={(_section, _value) => {}}
                />
              </motion.div>
            </div>
          </FeatureSection>
        </div>
        <div id="insider-connections">
          <FeatureSection
            title="Connect With Job Specific Industry Insiders For Direct Referrals"
            animationProps={animationProps}
            variant="alternate"
          >
            <div className="w-full max-w-6xl">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 mb-6 border border-blue-200/40 p-8 rounded-xl shadow-xl backdrop-blur-sm relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Add network lines effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.5 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`line-${i}`}
                      className="absolute h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: 0,
                        right: 0,
                        rotate: `${Math.random() * 5 - 2.5}deg`,
                        transformOrigin: "center",
                      }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: 0.1 * i, duration: 1.5 }}
                      viewport={{ once: true }}
                    />
                  ))}
                </motion.div>

                <AnimatePresence>
                  {selectedProfiles.map((profile, index) => (
                    <motion.div
                      key={`profile-${index}`}
                      className="relative"
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          delay: index * 0.05,
                          duration: 0.4,
                          ease: [0.2, 0.65, 0.3, 0.9],
                        },
                      }}
                      whileHover={{
                        y: -5,
                        scale: 1.03,
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        transition: { duration: 0.2 },
                      }}
                      viewport={{ once: true, margin: "-50px" }}
                    >
                      <LinkedInProfileCard index={index} profile={profile} />

                      {/* Add pulsing connection effect */}
                      <motion.div
                        className="absolute -inset-px rounded-xl border-2 border-blue-400/0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{
                          opacity: 1,
                          borderColor: "rgba(96, 165, 250, 0.3)",
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </FeatureSection>
        </div>

        {/* Add a new call-to-action section */}
        <motion.div
          className="w-full max-w-4xl mx-auto my-16 px-6 py-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Animated decorative elements */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDJsMTUgPS44IDEzLjggMzYuNSAzNi45IDUuNCAtMjYuNyAyNiA2LjMgMzYuOC0zMy4zLTE3LjUtMzMuMyAxNy41IDYuMy0zNi44TDU5IDE2Ny43IDk1LjkgMTYyLjMgMTA5LjcgMTI1LjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            transition={{ duration: 1 }}
          />

          <motion.div
            className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          />

          <motion.div
            className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            viewport={{ once: true }}
          />

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 relative flex flex-col justify-center items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Ready to Find Your Dream Job?
            <Button
              onClick={() => navigate("/jobs")}
              variant="secondary"
              size="xl"
              className="w-fit"
            >
              Get Started
            </Button>
          </motion.h2>
        </motion.div>
      </main>
    </div>
  );
};

export default HeroSection;
