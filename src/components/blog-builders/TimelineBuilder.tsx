import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { TimelineEvent } from "./types";

interface TimelineBuilderProps {
  timeline: TimelineEvent[];
  onChange: (timeline: TimelineEvent[]) => void;
}

export const TimelineBuilder: React.FC<TimelineBuilderProps> = ({ timeline, onChange }) => {
  const addEvent = () => {
    onChange([...timeline, { year: "", event: "" }]);
  };

  const updateEvent = (index: number, field: keyof TimelineEvent, value: string) => {
    const newTimeline = [...timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    onChange(newTimeline);
  };

  const removeEvent = (index: number) => {
    const newTimeline = timeline.filter((_, i) => i !== index);
    onChange(newTimeline);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Timeline Events</h3>
        <Button type="button" onClick={addEvent} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3 relative bg-card">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive"
              onClick={() => removeEvent(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <div>
              <Label>Year / Period (e.g. 1981)</Label>
              <Input 
                value={event.year} 
                onChange={(e) => updateEvent(index, "year", e.target.value)} 
                placeholder="Year"
              />
            </div>
            
            <div>
              <Label>Event Description</Label>
              <Textarea 
                value={event.event} 
                onChange={(e) => updateEvent(index, "event", e.target.value)} 
                placeholder="Event description..."
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
      {timeline.length === 0 && (
        <p className="text-sm text-muted-foreground">No timeline events added yet.</p>
      )}
    </div>
  );
};
