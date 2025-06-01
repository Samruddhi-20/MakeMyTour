import React, { useState } from 'react';
import { Review, AdminReply } from '@/types/review';

interface ReviewItemProps {
  review: Review;
  currentUserId?: string;
  onReviewUpdated: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, currentUserId, onReviewUpdated }) => {
  const [flagged, setFlagged] = useState(review.flagged);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleFlag = async () => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'flag', reviewId: review.id }),
      });
      if (res.ok) {
        setFlagged(true);
        onReviewUpdated();
      }
    } catch (error) {
      console.error('Failed to flag review:', error);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addReply',
          reviewId: review.id,
          text: replyText,
        }),
      });
      if (res.ok) {
        setReplyText('');
        setShowReplyForm(false);
        onReviewUpdated();
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderReplies = (replies: AdminReply[] | undefined, level = 1) => {
    if (!replies || replies.length === 0) return null;
    return (
      <div className={`ml-${level * 4} border-l pl-4 mt-2`}>
        {replies.map((reply) => (
          <div key={reply.id} className="mb-2">
            <div className="text-sm text-gray-700">{reply.text}</div>
            {renderReplies(reply.replies, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">{review.userName}</div>
        <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
      </div>
      <div className="mb-2">{review.text}</div>
      {review.images && review.images.length > 0 && (
        <div className="flex space-x-2 mb-2">
          {review.images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`Review image ${idx + 1}`}
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      )}
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <button
          disabled={flagged}
          onClick={handleFlag}
          className={`hover:underline ${flagged ? 'cursor-not-allowed' : ''}`}
        >
          {flagged ? 'Flagged' : 'Flag as Inappropriate'}
        </button>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="hover:underline"
        >
          {showReplyForm ? 'Cancel Reply' : 'Reply'}
        </button>
      </div>
      {showReplyForm && (
        <div className="mt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className="w-full border rounded p-2"
          />
          <button
            onClick={handleReplySubmit}
            disabled={submittingReply}
            className="mt-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Submit Reply
          </button>
        </div>
      )}
      {renderReplies(review.adminReplies)}
    </div>
  );
};

export default ReviewItem;
