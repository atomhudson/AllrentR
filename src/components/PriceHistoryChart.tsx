import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PriceHistoryEntry {
  id: string;
  old_price: number | null;
  new_price: number;
  changed_at: string;
}

interface PriceHistoryChartProps {
  listingId: string;
}

export const PriceHistoryChart = ({ listingId }: PriceHistoryChartProps) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase
          .from("price_history" as any)
          .select("*")
          .eq("listing_id", listingId)
          .order("changed_at", { ascending: true })) as any;

        if (error) throw error;
        setPriceHistory(data || []);
      } catch (err) {
        console.error("Error fetching price history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchPriceHistory();
    }
  }, [listingId]);

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#E5383B]"></div>
      </div>
    );
  }

  if (priceHistory.length <= 1) {
    return (
      <div className="p-4 rounded-xl bg-[#F5F3F4] text-center">
        <Minus className="w-5 h-5 mx-auto text-[#660708]/50 mb-2" />
        <p className="text-sm text-[#660708]/70">No price changes recorded</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = priceHistory.map((entry) => ({
    date: format(new Date(entry.changed_at), "MMM d"),
    fullDate: format(new Date(entry.changed_at), "MMM d, yyyy"),
    price: Number(entry.new_price),
  }));

  // Calculate price trend
  const firstPrice = priceHistory[0]?.new_price || 0;
  const lastPrice = priceHistory[priceHistory.length - 1]?.new_price || 0;
  const priceDiff = Number(lastPrice) - Number(firstPrice);
  const percentChange = firstPrice > 0 ? ((priceDiff / Number(firstPrice)) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#F5F3F4] to-white border border-[#E5E5E5]">
        <div>
          <p className="text-xs text-[#660708]/60 uppercase tracking-wide">Price Trend</p>
          <p className="text-lg font-semibold text-[#161A1D]">
            {priceHistory.length} changes
          </p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
          priceDiff > 0 
            ? "bg-red-100 text-red-600" 
            : priceDiff < 0 
              ? "bg-green-100 text-green-600" 
              : "bg-gray-100 text-gray-600"
        }`}>
          {priceDiff > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : priceDiff < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          <span>{priceDiff > 0 ? "+" : ""}{percentChange}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: "#660708" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E5E5" }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "#660708" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E5E5" }}
              tickFormatter={(value) => `₹${value}`}
              width={60}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #E5E5E5",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
              formatter={(value: number) => [`₹${value}`, "Price"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#E5383B" 
              strokeWidth={2}
              dot={{ fill: "#E5383B", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#BA181B" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Price history list */}
      <div className="max-h-32 overflow-y-auto space-y-1">
        {priceHistory.slice().reverse().map((entry, idx) => (
          <div 
            key={entry.id} 
            className="flex items-center justify-between py-1.5 px-2 text-xs rounded hover:bg-[#F5F3F4] transition-colors"
          >
            <span className="text-[#660708]/60">
              {format(new Date(entry.changed_at), "MMM d, yyyy")}
            </span>
            <div className="flex items-center gap-2">
              {entry.old_price !== null && (
                <span className="text-[#660708]/40 line-through">₹{entry.old_price}</span>
              )}
              <span className="font-medium text-[#161A1D]">₹{entry.new_price}</span>
              {idx === 0 && (
                <span className="text-[8px] uppercase bg-[#E5383B]/10 text-[#E5383B] px-1.5 py-0.5 rounded-full font-semibold">
                  Current
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceHistoryChart;
