import { useState, useEffect } from 'react';
import {
  Star,
  MessageCircle,
  ThumbsUp,
  Play,
  Sparkles,
  TrendingUp,
  Camera,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  MessageSquare,
  DollarSign,
  Target,
  Quote
} from 'lucide-react';
import { ReviewMediaUpload } from './ReviewMediaUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Reply {
  id: string;
  rating_id: string;
  user_id: string;
  reply_text: string;
  created_at: string;
}

interface Rating {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  rating_replies?: Reply[];
  media_urls?: string[] | null;
  helpful_votes?: number;
  rating_condition?: number;
  rating_communication?: number;
  rating_value?: number;
  rating_accuracy?: number;
}

interface ProfileMap {
  [key: string]: {
    name: string;
    avatar_url: string | null;
  };
}

interface RatingCardProps {
  listingId: string;
  currentUserId?: string;
}

// Rating category configuration with Lucide icons
const RATING_CATEGORIES = [
  { key: 'condition', label: 'Condition', Icon: Package, color: 'text-emerald-500' },
  { key: 'communication', label: 'Communication', Icon: MessageSquare, color: 'text-blue-500' },
  { key: 'value', label: 'Value', Icon: DollarSign, color: 'text-amber-500' },
  { key: 'accuracy', label: 'Accuracy', Icon: Target, color: 'text-purple-500' },
];

// Media Lightbox Component
const MediaLightbox = ({
  media,
  currentIndex,
  onClose,
  onNext,
  onPrev
}: {
  media: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.toLowerCase().match(/\.(mp4|webm|ogg)$/);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10" onClick={onClose}>
        <X className="w-6 h-6 text-white" />
      </button>
      {media.length > 1 && (
        <>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10" onClick={(e) => { e.stopPropagation(); onNext(); }}>
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}
      <div className="max-w-5xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video src={currentMedia} controls autoPlay className="max-w-full max-h-[90vh] rounded-xl" />
        ) : (
          <img src={currentMedia} alt="Review media" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
        )}
      </div>
      {media.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>
  );
};

export const RatingCard = ({ listingId, currentUserId }: RatingCardProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(false);
  const [fetchingRatings, setFetchingRatings] = useState(true);

  const [ratingCondition, setRatingCondition] = useState(0);
  const [ratingCommunication, setRatingCommunication] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingAccuracy, setRatingAccuracy] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [votingId, setVotingId] = useState<string | null>(null);

  const [showMediaUpload, setShowMediaUpload] = useState(false);

  const [lightboxMedia, setLightboxMedia] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { toast } = useToast();

  const openLightbox = (media: string[], index: number) => {
    setLightboxMedia(media);
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxMedia(null);
    setLightboxIndex(0);
    document.body.style.overflow = '';
  };

  const nextLightboxImage = () => {
    if (lightboxMedia) {
      setLightboxIndex(prev => prev === lightboxMedia.length - 1 ? 0 : prev + 1);
    }
  };

  const prevLightboxImage = () => {
    if (lightboxMedia) {
      setLightboxIndex(prev => prev === 0 ? lightboxMedia.length - 1 : prev - 1);
    }
  };

  const fetchRatings = async () => {
    setFetchingRatings(true);
    try {
      const { data: ratingsData, error } = await (supabase.from('ratings') as any)
        .select(`*, rating_replies (id, reply_text, created_at, user_id)`)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (ratingsData) {
        setRatings(ratingsData);
        await fetchProfiles(ratingsData);
      }
    } catch (err) {
      console.warn('Fetching with replies failed, using fallback:', err);
      try {
        const { data: ratingsData, error } = await supabase.from('ratings').select('*').eq('listing_id', listingId).order('created_at', { ascending: false });
        if (!error && ratingsData) {
          setRatings(ratingsData);
          await fetchProfiles(ratingsData);
        }
      } catch (fallbackErr) {
        console.error('Failed to fetch ratings:', fallbackErr);
      }
    } finally {
      setFetchingRatings(false);
    }
  };

  const fetchProfiles = async (data: any[]) => {
    const userIds = new Set<string>();
    data.forEach(r => {
      userIds.add(r.user_id);
      r.rating_replies?.forEach((reply: any) => userIds.add(reply.user_id));
    });

    if (userIds.size > 0) {
      const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar_url').in('id', Array.from(userIds));
      if (profilesData) {
        const profileMap: ProfileMap = {};
        profilesData.forEach(p => {
          profileMap[p.id] = { name: p.name, avatar_url: p.avatar_url };
        });
        setProfiles(prev => ({ ...prev, ...profileMap }));
      }
    }
  };

  const fetchUserVotes = async () => {
    if (!currentUserId) return;
    try {
      const { data } = await (supabase as any).from('rating_votes').select('rating_id').eq('user_id', currentUserId);
      if (data) {
        const votes: Record<string, boolean> = {};
        data.forEach((v: any) => votes[v.rating_id] = true);
        setUserVotes(votes);
      }
    } catch (err) {
      console.warn('Could not fetch user votes:', err);
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUserId) {
      toast({ title: 'Login Required', description: 'Please log in to leave a review', variant: 'destructive' });
      return;
    }

    if (ratingCondition === 0 || ratingCommunication === 0 || ratingValue === 0 || ratingAccuracy === 0) {
      toast({ title: 'Incomplete Rating', description: 'Please rate all categories before submitting', variant: 'destructive' });
      return;
    }

    const overallRating = Math.round((ratingCondition + ratingCommunication + ratingValue + ratingAccuracy) / 4);

    setLoading(true);
    try {
      const ratingData: any = {
        listing_id: listingId,
        user_id: currentUserId,
        rating: overallRating,
        comment: userComment || null,
        rating_condition: ratingCondition,
        rating_communication: ratingCommunication,
        rating_value: ratingValue,
        rating_accuracy: ratingAccuracy,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      };

      const { error } = await (supabase.from('ratings') as any).upsert(ratingData, { onConflict: 'listing_id, user_id' });
      if (error) throw error;

      toast({ title: 'Review Submitted!', description: 'Thank you for sharing your experience' });

      setRatingCondition(0);
      setRatingCommunication(0);
      setRatingValue(0);
      setRatingAccuracy(0);
      setUserComment('');
      setMediaUrls([]);
      setShowMediaUpload(false);
      fetchRatings();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit review', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (ratingId: string) => {
    if (!currentUserId) {
      toast({ title: 'Login Required', description: 'Please log in to reply', variant: 'destructive' });
      return;
    }
    if (!replyText.trim()) {
      toast({ title: 'Empty Reply', description: 'Please write something before posting', variant: 'destructive' });
      return;
    }

    setReplyLoading(true);
    try {
      const { error } = await (supabase as any).from('rating_replies').insert({ rating_id: ratingId, user_id: currentUserId, reply_text: replyText.trim() });
      if (error) throw error;
      toast({ title: 'Reply Posted', description: 'Your reply has been added' });
      setReplyText('');
      setReplyingTo(null);
      fetchRatings();
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      toast({ title: 'Error', description: error.message || 'Failed to post reply.', variant: 'destructive' });
    } finally {
      setReplyLoading(false);
    }
  };

  const handleHelpfulVote = async (ratingId: string, currentVotes: number) => {
    if (!currentUserId) {
      toast({ title: 'Login Required', description: 'Please log in to vote', variant: 'destructive' });
      return;
    }
    if (userVotes[ratingId]) {
      toast({ title: 'Already Voted', description: 'You have already marked this review as helpful' });
      return;
    }

    setVotingId(ratingId);
    setRatings(prev => prev.map(r => r.id === ratingId ? { ...r, helpful_votes: (r.helpful_votes || 0) + 1 } : r));
    setUserVotes(prev => ({ ...prev, [ratingId]: true }));

    try {
      const { error: voteError } = await (supabase as any).from('rating_votes').insert({ rating_id: ratingId, user_id: currentUserId, vote_type: true });
      if (voteError) throw voteError;

      const { error: updateError } = await (supabase as any).from('ratings').update({ helpful_votes: (currentVotes || 0) + 1 }).eq('id', ratingId);
      if (updateError) throw updateError;

      toast({ title: 'Thanks!', description: 'You marked this review as helpful' });
    } catch (error: any) {
      console.error('Error voting:', error);
      setRatings(prev => prev.map(r => r.id === ratingId ? { ...r, helpful_votes: currentVotes } : r));
      setUserVotes(prev => { const newVotes = { ...prev }; delete newVotes[ratingId]; return newVotes; });
      toast({ title: 'Error', description: 'Could not record your vote.', variant: 'destructive' });
    } finally {
      setVotingId(null);
    }
  };

  useEffect(() => {
    if (listingId) fetchRatings();
  }, [listingId]);

  useEffect(() => {
    if (currentUserId) fetchUserVotes();
  }, [currentUserId]);

  const averageRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : '0.0';

  const categoryAverages = {
    condition: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + (r.rating_condition || r.rating), 0) / ratings.length).toFixed(1) : '0.0',
    communication: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + (r.rating_communication || r.rating), 0) / ratings.length).toFixed(1) : '0.0',
    value: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + (r.rating_value || r.rating), 0) / ratings.length).toFixed(1) : '0.0',
    accuracy: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + (r.rating_accuracy || r.rating), 0) / ratings.length).toFixed(1) : '0.0',
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length > 0 ? (ratings.filter(r => r.rating === star).length / ratings.length) * 100 : 0
  }));

  const ratingSetters = [
    { key: 'condition', value: ratingCondition, set: setRatingCondition },
    { key: 'communication', value: ratingCommunication, set: setRatingCommunication },
    { key: 'value', value: ratingValue, set: setRatingValue },
    { key: 'accuracy', value: ratingAccuracy, set: setRatingAccuracy },
  ];

  return (
    <>
      {lightboxMedia && (
        <MediaLightbox
          media={lightboxMedia}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextLightboxImage}
          onPrev={prevLightboxImage}
        />
      )}

      <div className="space-y-6">
        {/* Header: Overall Rating + Category Breakdown in one row */}
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Left: Overall Rating */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  <Star className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#161A1D]">{averageRating}</span>
                  <span className="text-lg text-gray-400">/5</span>
                </div>
                <p className="text-sm text-gray-500">{ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}</p>
                {/* Mini distribution */}
                <div className="flex gap-0.5 mt-1">
                  {ratingDistribution.map(({ star, percentage }) => (
                    <div key={star} className="w-8 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${percentage}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-20 bg-gray-200" />

            {/* Right: Category Breakdown */}
            <div className="flex-1 grid grid-cols-4 gap-3">
              {RATING_CATEGORIES.map(cat => {
                const Icon = cat.Icon;
                return (
                  <div key={cat.key} className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-xl bg-gray-50 flex items-center justify-center mb-1.5 ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">{cat.label}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-sm font-semibold text-[#161A1D]">
                        {categoryAverages[cat.key as keyof typeof categoryAverages]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Write a Review */}
        {currentUserId && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-[#161A1D]">Share Your Experience</h3>
            </div>

            {/* Rating Categories - Horizontal */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {RATING_CATEGORIES.map((cat, idx) => {
                const Icon = cat.Icon;
                const setter = ratingSetters[idx];
                return (
                  <div key={cat.key} className="p-3 rounded-xl bg-white border border-gray-100 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setter.set(star)}
                          className="group transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-all ${star <= setter.value
                              ? 'fill-primary text-primary'
                              : 'text-gray-300 group-hover:text-primary/40'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comment Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Tell others about your experience..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="min-h-[80px] bg-white border-gray-200 text-[#161A1D] placeholder:text-gray-400 focus:border-primary/50 focus:ring-primary/20 rounded-xl resize-none pr-24"
                  rows={3}
                />
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMediaUpload(!showMediaUpload)}
                    className={`h-8 px-2.5 rounded-lg ${showMediaUpload ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleSubmitRating}
                    disabled={loading}
                    size="sm"
                    className="h-8 px-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-lg shadow-sm"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            {showMediaUpload && (
              <div className="mt-3 p-3 rounded-xl bg-white border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <ReviewMediaUpload userId={currentUserId} onMediaUploaded={setMediaUrls} />
                {mediaUrls.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">{mediaUrls.length} file{mediaUrls.length > 1 ? 's' : ''} ready</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Customer Reviews</h3>

          {fetchingRatings ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : ratings.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-gray-50 border border-gray-100">
              <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No reviews yet — be the first!</p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div
                key={rating.id}
                className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/10">
                      {profiles[rating.user_id]?.avatar_url ? (
                        <img src={profiles[rating.user_id].avatar_url!} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {(profiles[rating.user_id]?.name || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#161A1D]">{profiles[rating.user_id]?.name || 'Anonymous'}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= rating.rating ? 'fill-primary text-primary' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(rating.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setReplyingTo(replyingTo === rating.id ? null : rating.id); setReplyText(''); }}
                      className="text-gray-400 hover:text-primary hover:bg-primary/5 h-8 w-8 p-0 rounded-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {RATING_CATEGORIES.map(cat => {
                    const Icon = cat.Icon;
                    const val = rating[`rating_${cat.key}` as keyof Rating] as number || rating.rating;
                    return (
                      <div key={cat.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                        <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        <span className="text-xs text-gray-600">{cat.label}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="text-xs font-medium text-[#161A1D]">{val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Media Gallery */}
                {rating.media_urls && rating.media_urls.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {rating.media_urls.map((url, idx) => {
                      const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg)$/);
                      return (
                        <button
                          key={idx}
                          onClick={() => openLightbox(rating.media_urls!, idx)}
                          className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        >
                          {isVideo ? (
                            <div className="relative w-full h-full bg-gray-100">
                              <video src={url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-5 h-5 text-white fill-white" />
                              </div>
                            </div>
                          ) : (
                            <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Comment */}
                {rating.comment && (
                  <div className="flex gap-2 mb-3">
                    <Quote className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed">{rating.comment}</p>
                  </div>
                )}

                {/* Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpfulVote(rating.id, rating.helpful_votes || 0)}
                  disabled={votingId === rating.id}
                  className={`h-7 px-3 text-xs rounded-full border transition-all ${userVotes[rating.id]
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5'
                    }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 mr-1.5 ${userVotes[rating.id] ? 'fill-current' : ''}`} />
                  Helpful · {rating.helpful_votes || 0}
                </Button>

                {/* Replies */}
                {rating.rating_replies && rating.rating_replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-2">
                    {rating.rating_replies.map((reply) => (
                      <div key={reply.id} className="p-3 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                            <span className="text-[8px] font-semibold text-accent">
                              {(profiles[reply.user_id]?.name || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-700">{profiles[reply.user_id]?.name || 'User'}</span>
                          <span className="text-[10px] text-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600">{reply.reply_text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === rating.id && (
                  <div className="mt-3 pl-4 border-l-2 border-primary/30 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[60px] text-sm bg-white border-gray-200 rounded-xl flex-1"
                      />
                      <div className="flex flex-col gap-1">
                        <Button size="sm" onClick={() => handleSubmitReply(rating.id)} disabled={replyLoading} className="bg-gradient-to-r from-primary to-accent text-white rounded-lg h-7 px-3 text-xs">
                          {replyLoading ? '...' : 'Post'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="text-gray-500 h-7 px-3 text-xs">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
