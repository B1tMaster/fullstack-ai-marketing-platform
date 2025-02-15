// File: /components/FAQ.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How do I upload my content to the platform?",
    answer:
      "Simply click on the 'Upload Media' button and select the text, audio, or video files you want to upload. Our platform supports a variety of formats, making it easy to get your content ready for processing.",
  },
  {
    question: "How does the AI summarize my content?",
    answer:
      "After you upload your content, our AI analyzes the text, audio, or video to identify key points and generate a concise summary. This summary helps you quickly grasp the main ideas of your content without going through the entire material.",
  },
  {
    question: "What are custom prompts, and how do I use them?",
    answer:
      "Custom prompts allow you to guide the AI in generating content that aligns with your specific needs. You can add up to 1,000,000 prompts to tailor the output, ensuring it reflects your style, tone, and messaging goals.",
  },
  {
    question: "What types of marketing materials can the app generate?",
    answer:
      "The app can create a wide range of marketing materials, including social media posts, blog summaries, promotional videos, newsletters, courses, prelaunch, launch, reminder campaigns and more. By analyzing your uploaded content and following your custom prompts, our AI generates materials tailored to your audience and marketing strategy.",
  },
];

const FAQ = () => {
  return (
    <section className="py-12 px-6">
      <h2 className="text-3xl font-bold text-center text-secondary mb-8">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
        {FAQS.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left accordion-trigger">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQ;
