import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { FAQItem } from "./types";

interface FAQBuilderProps {
  faq: FAQItem[];
  onChange: (faq: FAQItem[]) => void;
}

export const FAQBuilder: React.FC<FAQBuilderProps> = ({ faq, onChange }) => {
  const addQuestion = () => {
    onChange([...faq, { question: "", answer: "" }]);
  };

  const updateQuestion = (index: number, field: keyof FAQItem, value: string) => {
    const newFaq = [...faq];
    newFaq[index] = { ...newFaq[index], [field]: value };
    onChange(newFaq);
  };

  const removeQuestion = (index: number) => {
    const newFaq = faq.filter((_, i) => i !== index);
    onChange(newFaq);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">FAQ Accordion</h3>
        <Button type="button" onClick={addQuestion} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      <div className="space-y-4">
        {faq.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3 relative bg-card">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive"
              onClick={() => removeQuestion(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <div>
              <Label>Question</Label>
              <Input 
                value={item.question} 
                onChange={(e) => updateQuestion(index, "question", e.target.value)} 
                placeholder="E.g. What is the share price today?"
              />
            </div>
            
            <div>
              <Label>Answer</Label>
              <Textarea 
                value={item.answer} 
                onChange={(e) => updateQuestion(index, "answer", e.target.value)} 
                placeholder="Provide a detailed answer..."
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
      {faq.length === 0 && (
        <p className="text-sm text-muted-foreground">No FAQ items added yet.</p>
      )}
    </div>
  );
};
