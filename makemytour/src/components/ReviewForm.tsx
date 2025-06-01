import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { ReviewInput } from '@/types/review';

interface ReviewFormProps {
  entityId: string;
  entityType: 'flight' | 'hotel';
  userId: string;
  userName: string;
  existingReview?: ReviewInput & { id?: string };
  onReviewSubmitted: () => void;
}

const profanityList = ['badword1', 'badword2', 'badword3'];

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some((word) => lowerText.includes(word));
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  entityId,
  entityType,
  userId,
  userName,
  existingReview,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [text, setText] = useState<string>(existingReview?.text || '');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setText(existingReview.text);
    }
  }, [existingReview]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const validateInput = (): boolean => {
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5 stars.');
      return false;
    }
    if (!text.trim()) {
      setError('Review text cannot be empty.');
      return false;
    }
    if (containsProfanity(text)) {
      setError('Please remove profanity from your review.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setSubmitting(true);

    try {
      // For simplicity, images are not uploaded separately here.
      // In a real app, upload images first and get URLs.
      const reviewPayload = {
        id: existingReview?.id,
        userId,
        userName,
        entityId,
        entityType,
        rating,
        text,
        images: [], // Image upload handling to be implemented
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit review.');
      } else {
        setRating(0);
        setText('');
        setImages([]);
        onReviewSubmitted();
      }
    } catch (err) {
      setError('An error occurred while submitting your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
      <div className="mb-2">
        <label className="block mb-1 font-medium">Rating (1-5 stars)</label>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded px-2 py-1 w-20"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1 font-medium">Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1 font-medium">Upload Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {existingReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
