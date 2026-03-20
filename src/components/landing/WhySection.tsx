"use client";

import { motion } from "framer-motion";

export default function WhySection() {
  const features = [
    {
      title: "Real-World Challenges",
      description: "Test your skills against vulnerabilities found in production systems",
    },
    {
      title: "Community Driven",
      description: "Learn from and contribute to a growing security research community",
    },
    {
      title: "Progressive Difficulty",
      description: "Start with basics and work your way up to advanced exploitation techniques",
    },
  ];

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">
            Why AccessDenied?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe in making security education accessible, practical, and engaging for everyone.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}