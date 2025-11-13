"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string | StaticImageData;
  delay?: number;
}

const FeatureCard = ({ title, description, icon, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      <Card className="relative overflow-visible rounded-3xl p-8 bg-white dark:bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(226,59,109,0.15)] transition-all duration-300 border-4 border-pink-900/10 hover:border-[#FF7CA3]/20 h-full flex flex-col items-center text-center">
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-linear-to-br from-[#E23B6D] to-[#FF7CA3] p-1 shadow-lg group-hover:shadow-[0_0_20px_#FF7CA3] transition-shadow duration-300"
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-white flex items-center justify-center overflow-hidden">
            <Image 
              src={icon}
              alt={title}
              width={112}
              height={112}
              className="w-28 h-28 object-cover"
            />
          </div>
        </motion.div>
        <div className="mt-15 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-md text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[#E23B6D]/0 to-[#FF7CA3]/0 group-hover:from-[#E23B6D]/5 group-hover:to-[#FF7CA3]/5 transition-all duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
