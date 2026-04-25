import React from 'react';
import { BlogExtraData, StatBox, TimelineEvent, FAQItem } from './blog-builders/types';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BlogExtraSectionsProps {
  data: BlogExtraData;
}

export const BlogExtraSections: React.FC<BlogExtraSectionsProps> = ({ data }) => {
  return (
    <div className="space-y-16 mt-12 mb-12">
      {/* Stats Section */}
      {data.stats && data.stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {data.stats.map((stat: StatBox, idx: number) => {
            const isRed = stat.valueColor === "red";
            const isGreen = stat.valueColor === "green";
            const colorClass = isRed ? "text-[#E5383B]" : isGreen ? "text-green-500" : "text-[#161A1D] dark:text-white";
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className="p-5 rounded-xl border border-[#D3D3D3]/50 bg-[#F5F3F4] hover:shadow-md transition-all group"
              >
                <div className="text-xs font-semibold tracking-wider text-[#660708]/80 uppercase mb-2">
                  {stat.title}
                </div>
                <div className={`text-2xl md:text-3xl font-bold mb-1 ${colorClass}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-[#161A1D]/60 font-medium">
                  {stat.subtitle}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Timeline Section */}
      {data.timeline && data.timeline.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-[#161A1D] mb-8">Journey & Timeline</h3>
          <div className="relative border-l-2 border-[#E5383B]/30 pl-8 space-y-10">
            {data.timeline.map((item: TimelineEvent, idx: number) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className="relative"
              >
                {/* Dot */}
                <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 border-[#F5F3F4] bg-[#E5383B] shadow-sm" />
                <div className="text-[#E5383B] font-bold text-lg mb-2">{item.year}</div>
                <p className="text-[#161A1D]/80 leading-relaxed font-medium">
                  {item.event}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {data.faq && data.faq.length > 0 && (
        <div className="max-w-3xl mx-auto bg-[#F5F3F4] p-8 md:p-10 rounded-3xl border border-[#D3D3D3]/50">
          <h3 className="text-2xl md:text-3xl font-bold text-[#161A1D] mb-6">
            FAQ — Top Questions
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {data.faq.map((item: FAQItem, idx: number) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-[#D3D3D3]/50">
                <AccordionTrigger className="text-left font-bold text-lg hover:text-[#E5383B] transition-colors py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#161A1D]/80 leading-relaxed text-base font-medium pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};
