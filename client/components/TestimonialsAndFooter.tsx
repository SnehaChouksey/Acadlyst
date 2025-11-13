"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, } from "lucide-react";
import { Sparkles } from "lucide-react";

import next from "next";

// Example testimonials data (replace with real data or import)
const testimonials = [
  {
    name: "Ishaan",
    avatar: "🦉",
    text: "Acadlyst's AI summaries save me hours every week!",
  },
  {
    name: "Priya",
    avatar: "🌻",
    text: "The quiz generator transformed how I prep for exams.",
  },
  {
    name: "Arjun",
    avatar: "🦁",
    text: "I never thought chat-based PDF Q&A could be this intuitive.",
  },
  {
    name: "Meera",
    avatar: "🦋",
    text: "No more struggling with notes—Acadlyst brings clarity fast.",
  },
  {
    name: "Rahul",
    avatar: "🧠",
    text: "Better than any flashcards app I've used!",
  },
  
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "/" },
  { label: "Chat", href: "/qna/pdf" },
  { label: "Contact", href: "#" },
];

const socials = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: Twitter,
  },
];

export default function TestimonialsAndFooter() {
  return (
    <div>
      {/* Testimonials Section */}
      <section className="relative py-20 px-6 bg-background/20 overflow-hidden">

        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-6">
            <h3 className="text-4xl md:text-4xl font-bold mb-6 bg-linear-to-r from-[#E23B6D] to-[#ff006f] bg-clip-text text-transparent">
              What Students Say About Acadlyst
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real experiences from learners using AI to supercharge their studies
            </p>
          </div>

    <div className="flex justify-center mb-4">
        <div className="inline-block mb-4 px-6 py-3 rounded-full bg-accent/10 border border-accent/30  backdrop-blur-sm">
            <span className="text-sm font-medium bg-gradient-primary bg-clip-text text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                    Learn Smarter , not Harder
            </span>
        </div>
    </div>    

          
          <div className="relative w-full overflow-hidden mb-6 group">
            <motion.div
              className="flex gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ willChange: "transform" }}
            >
              {[...testimonials, ...testimonials].map((testimonial, i) => (
                <div
                  key={`row1-${i}`}
                  className="min-w-[320px] md:min-w-[350px] p-6 bg-card/80 backdrop-blur-sm rounded-2xl border-t-2 border-primary/30 shadow-lg hover:shadow-card-glow transition-all duration-300 shrink-0"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#E23B6D] to-[#ff5398] flex items-center justify-center text-white font-semibold shrink-0 text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/80 italic leading-relaxed">
                        "{testimonial.text}"
                      </p>
                    </div>
                  </div>
                  <h4 className="font-semibold bg-linear-to-r from-[#E23B6D] to-[#ff5588] bg-clip-text text-transparent">
                    — {testimonial.name}
                  </h4>
                </div>
              ))}
            </motion.div>
          </div>

          
          <div className="relative w-full overflow-hidden group">
            <motion.div
              className="flex gap-6"
              animate={{ x: ["-50%", "0%"] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ willChange: "transform" }}
            >
              {[...testimonials, ...testimonials].map((testimonial, i) => (
                <div
                  key={`row2-${i}`}
                  className="min-w-[320px] md:min-w-[350px] p-6 bg-card/80 backdrop-blur-sm rounded-2xl border-t-2 border-primary/30 shadow-lg hover:shadow-card-glow transition-all duration-300 flex-shrink-0"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#E23B6D] to-[#FF7CA3] flex items-center justify-center text-white font-semibold shrink-0 text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/80 italic leading-relaxed">
                        "{testimonial.text}"
                      </p>
                    </div>
                  </div>
                  <h4 className="font-semibold bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] bg-clip-text text-transparent">
                    — {testimonial.name}
                  </h4>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      
      <footer className="relative py-12 px-6 bg-linear-to-r from-accent/40 via-accent/30 to-background border-t border-primary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center space-y-8">
            
            <div className="text-center ">
            <div className="flex flex-col items-center mb-4">
          <img
            src="/acadlyst_logo.png"
            alt="Acadlyst Logo"
            className="w-16 h-16 mb-2 mx-auto rounded-none object-fill"
            
         />
      < h3 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-foreground/50 to-foreground bg-clip-text text-transparent mb-2">
        Acadlyst
      </h3>
      </div>

              <p className="text-sm text-muted-foreground max-w-md">
                Built by  a student, for students. Empowered by AI.
              </p>
              
            </div>

            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-foreground/70 hover:text-primary transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            
            <div className="flex space-x-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-xs text-muted-foreground/60 text-center pt-4 border-t border-border/30 w-full">
              <p>© 2025 Acadlyst. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
