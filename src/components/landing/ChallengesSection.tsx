"use client";

import { motion } from "framer-motion";

export default function ChallengesSection() {
  const challenges = [
    {
      title: "Web Application Security",
      count: "24 challenges",
      description: "Test your skills against common web vulnerabilities",
    },
    {
      title: "Network Security",
      count: "18 challenges",
      description: "Explore network protocols and infrastructure attacks",
    },
    {
      title: "Cryptography",
      count: "15 challenges",
      description: "Break encryption schemes and understand crypto flaws",
    },
    {
      title: "Reverse Engineering",
      count: "12 challenges",
      description: "Analyze and understand compiled programs and malware",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">
            Challenge Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore different areas of cybersecurity and build your expertise
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                {challenge.title}
              </h3>
              <p className="text-sm text-primary font-medium mb-3">
                {challenge.count}
              </p>
              <p className="text-muted-foreground text-sm">
                {challenge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}