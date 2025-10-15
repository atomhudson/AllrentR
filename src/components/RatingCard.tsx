import { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Rating {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface RatingCardProps {
  listingId: string;
  currentUserId?: string;
}

export const RatingCard = ({ listingId, currentUserId }: RatingCardProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const fetchRatings = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRatings(data);
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUserId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to rate',
        variant: 'destructive',
      });
      return;
    }

    if (userRating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('ratings').upsert({
      listing_id: listingId,
      user_id: currentUserId,
      rating: userRating,
      comment: userComment || null,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit rating',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Rating submitted successfully',
      });
      setUserRating(0);
      setUserComment('');
      fetchRatings();
    }
    setLoading(false);
  };

  useState(() => {
    fetchRatings();
  });

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0';

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-accent text-accent" />
          Ratings & Reviews ({ratings.length})
          <span className="text-muted-foreground ml-2">Avg: {averageRating}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentUserId && (
          <div className="p-4 border border-border rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-3">Leave a Rating</h4>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || userRating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Write your review (optional)..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="mb-3"
              rows={3}
            />
            <Button onClick={handleSubmitRating} disabled={loading}>
              Submit Rating
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {ratings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No ratings yet. Be the first to rate!
            </p>
          ) : (
            ratings.map((rating) => (
              <div
                key={rating.id}
                className="p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating.rating
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-sm text-foreground">{rating.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
