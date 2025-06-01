import React, { useEffect, useState } from 'react';
import { Review, SortOption } from '@/types/review';
import ReviewItem from './ReviewItem';

interface ReviewListProps {
  entityId: string;
  entityType: 'flight' | 'hotel';
  userId?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ entityId, entityType, userId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?entityId=${entityId}&entityType=${entityType}&sortBy=${sortBy}`
      );
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [entityId, entityType, sortBy]);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border rounded px-2 py-1"
        >
          <option value="newest">Newest</option>
          <option value="mostHelpful">Most Helpful</option>
        </select>
      </div>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            currentUserId={userId}
            onReviewUpdated={fetchReviews}
          />
        ))
      )}
    </div>
  );
};

export default ReviewList;
