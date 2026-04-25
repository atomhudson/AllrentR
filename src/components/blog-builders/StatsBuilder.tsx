import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { StatBox } from "./types";

interface StatsBuilderProps {
  stats: StatBox[];
  onChange: (stats: StatBox[]) => void;
}

export const StatsBuilder: React.FC<StatsBuilderProps> = ({ stats, onChange }) => {
  const addStat = () => {
    onChange([...stats, { title: "", value: "", subtitle: "", valueColor: "default" }]);
  };

  const updateStat = (index: number, field: keyof StatBox, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange(newStats);
  };

  const removeStat = (index: number) => {
    const newStats = stats.filter((_, i) => i !== index);
    onChange(newStats);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Stats Banners</h3>
        <Button type="button" onClick={addStat} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Add Stat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3 relative bg-card">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive"
              onClick={() => removeStat(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <div>
              <Label>Title (e.g. TODAY'S PRICE)</Label>
              <Input 
                value={stat.title} 
                onChange={(e) => updateStat(index, "title", e.target.value)} 
                placeholder="Title"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Value (e.g. ₹1,201)</Label>
                <Input 
                  value={stat.value} 
                  onChange={(e) => updateStat(index, "value", e.target.value)} 
                  placeholder="Value"
                />
              </div>
              <div className="w-24">
                <Label>Color</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={stat.valueColor || "default"}
                  onChange={(e) => updateStat(index, "valueColor", e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Subtitle (e.g. As of Apr 24, 2026)</Label>
              <Input 
                value={stat.subtitle} 
                onChange={(e) => updateStat(index, "subtitle", e.target.value)} 
                placeholder="Subtitle"
              />
            </div>
          </div>
        ))}
      </div>
      {stats.length === 0 && (
        <p className="text-sm text-muted-foreground">No stats added yet.</p>
      )}
    </div>
  );
};
