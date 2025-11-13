"use client";
import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from '@/components/FeatureCard';
import smartQaIcon from '@/app/assets/smart-qa-3d.png';
import aiSummarizerIcon from '@/app/assets/ai-summarizer-3d.png';
import quizGeneratorIcon from '@/app/assets/quiz-generator-3d.png';



import type { StaticImageData } from 'next/image';

const features = [
  {
    title: 'Smart Q&A',
    description: 'Ask anything about your notes and get instant, AI-powered explanations.',
    icon: smartQaIcon,
  },
  {
    title: 'AI Summarizer',
    description: 'Turn lengthy lectures and PDFs into concise, actionable summaries.',
    icon: aiSummarizerIcon,
  },
  {
    title: 'Quiz Generator',
    description: 'Create quizzes from text, PDFs, or YouTube videos to test your knowledge.',
    icon: quizGeneratorIcon,
  },
];

const FeatureSection = () => {
  return (
    <section id="features" className="relative py-24 bg-linear-to-b from-background to-background-50/30 dark:from-background-950 dark:to-background-900 flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-[#E23B6D] to-[#ff0080] bg-clip-text text-transparent">
              Powerful AI Features
            </span>
            <br />
            <span className="bg-linear-to-r from-[#E23B6D] to-[#ff0077] bg-clip-text text-transparent">
              to Accelerate Your Learning
            </span>
          </h2>
          <div className="flex justify-center mt-4 mb-6">
            <div className="h-1 w-52 bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] rounded-full" />
          </div>
            <p className="mt-3 text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Acadlyst combines smart summarization, Q&A, and adaptive quizzes — all powered by GenAI.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 pt-5">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
