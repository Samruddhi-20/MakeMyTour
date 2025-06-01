import type { NextApiRequest, NextApiResponse } from 'next';
import { Review, AdminReply, SortOption } from '@/types/review';
import { v4 as uuidv4 } from 'uuid';
import sanitizeHtml from 'sanitize-html';
import formidable, { Formidable } from 'formidable';
import fs from 'fs';
import path from 'path';

// In-memory storage for demonstration purposes
let reviews: Review[] = [];

// Basic profanity filter list (expand as needed)
const profanityList = ['badword1', 'badword2', 'badword3'];

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some((word) => lowerText.includes(word));
}

function sanitizeInput(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

function sortReviews(reviews: Review[], sortBy: SortOption): Review[] {
  if (sortBy === 'mostHelpful') {
    return [...reviews].sort((a, b) => b.helpfulCount - a.helpfulCount);
  } else if (sortBy === 'newest') {
    return [...reviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return reviews;
}

// Helper to save uploaded file to /public/uploads and return URL path
async function saveFile(file: formidable.File): Promise<string> {
  const data = fs.readFileSync(file.filepath);
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const fileName = `${uuidv4()}_${file.originalFilename}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, data);
  return `/uploads/${fileName}`;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Query params: entityId, entityType, sortBy
      const { entityId, entityType, sortBy } = req.query;

      if (
        typeof entityId !== 'string' ||
        (entityType !== 'flight' && entityType !== 'hotel')
      ) {
        return res.status(400).json({ error: 'Invalid entity parameters' });
      }

      let filteredReviews = reviews.filter(
        (r) => r.entityId === entityId && r.entityType === entityType
      );

      if (sortBy && (sortBy === 'mostHelpful' || sortBy === 'newest')) {
        filteredReviews = sortReviews(filteredReviews, sortBy as SortOption);
      }

      return res.status(200).json(filteredReviews);
    } else if (req.method === 'POST') {
      // Parse multipart form data for image upload
      const form = new Formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024 }); // 5MB limit

      form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
          console.error('Form parse error:', err);
          return res.status(400).json({ error: 'Error parsing form data' });
        }

        const {
          id,
          userId,
          userName,
          entityId,
          entityType,
          rating,
          text,
        } = fields;

        // Validate required fields
        if (
          !userId ||
          !userName ||
          !entityId ||
          (typeof entityType !== 'string' || (entityType !== 'flight' && entityType !== 'hotel')) ||
          !rating ||
          Number(rating) < 1 ||
          Number(rating) > 5 ||
          !text
        ) {
          return res.status(400).json({ error: 'Invalid review data' });
        }

        const reviewText = Array.isArray(text) ? text.join(' ') : text;
        if (containsProfanity(reviewText)) {
          return res.status(400).json({ error: 'Profanity detected in review text' });
        }

        const sanitizedText = sanitizeInput(reviewText);

        // Handle images
        let imageUrls: string[] = [];
        if (files.images) {
          const imagesArray = Array.isArray(files.images) ? files.images : [files.images];
          for (const file of imagesArray) {
            // Validate file type
            if (!file.mimetype?.startsWith('image/')) {
              return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
            }
            // Validate file size
            if (file.size > 5 * 1024 * 1024) {
              return res.status(400).json({ error: 'File size exceeds 5MB limit.' });
            }
            const url = await saveFile(file);
            imageUrls.push(url);
          }
        }

        if (id) {
          // Update existing review
          const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
          const index = reviews.findIndex((r) => {
            const reviewUserId = Array.isArray(r.userId) ? r.userId[0] : r.userId;
            return r.id === id && reviewUserId === (Array.isArray(normalizedUserId) ? normalizedUserId[0] : normalizedUserId);
          });
          if (index === -1) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
          }
          reviews[index] = {
            ...reviews[index],
            rating: Number(rating),
            text: sanitizedText,
            images: imageUrls.length > 0 ? imageUrls : reviews[index].images,
            updatedAt: new Date().toISOString(),
          };
          return res.status(200).json(reviews[index]);
        } else {
          // Create new review
          const newReview: Review = {
            id: uuidv4(),
            userId: Array.isArray(userId) ? userId[0] : userId,
            userName: Array.isArray(userName) ? userName[0] : userName,
            entityId: Array.isArray(entityId) ? entityId[0] : entityId,
            entityType: entityType as 'flight' | 'hotel',
            rating: Number(rating),
            text: sanitizedText,
            images: imageUrls,
            flagged: false,
            createdAt: new Date().toISOString(),
            helpfulCount: 0,
            adminReplies: [],
          };
          reviews.push(newReview);
          return res.status(201).json(newReview);
        }
      });
    } else if (req.method === 'DELETE') {
      // Delete review by id and userId
      const { id, userId } = req.body;
      if (!id || !userId) {
        return res.status(400).json({ error: 'Missing id or userId' });
      }
      const index = reviews.findIndex((r) => r.id === id && r.userId === userId);
      if (index === -1) {
        return res.status(404).json({ error: 'Review not found or unauthorized' });
      }
      reviews.splice(index, 1);
      return res.status(200).json({ message: 'Review deleted' });
    } else if (req.method === 'PATCH') {
      // Handle flagging or admin replies
      const { action, reviewId, userId, text, parentReplyId } = req.body;

      const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
      if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (action === 'flag') {
        reviews[reviewIndex].flagged = true;
        return res.status(200).json({ message: 'Review flagged' });
      } else if (action === 'addReply') {
        if (!text) {
          return res.status(400).json({ error: 'Reply text is required' });
        }
        const sanitizedText = sanitizeInput(text);
        const newReply: AdminReply = {
          id: uuidv4(),
          reviewId,
          text: sanitizedText,
          createdAt: new Date().toISOString(),
          parentReplyId,
          replies: [],
        };

        if (parentReplyId) {
          // Find parent reply and add nested reply
          function addNestedReply(replies: AdminReply[]): boolean {
            for (const reply of replies) {
              if (reply.id === parentReplyId) {
                reply.replies = reply.replies || [];
                reply.replies.push(newReply);
                return true;
              }
              if (reply.replies && addNestedReply(reply.replies)) {
                return true;
              }
            }
            return false;
          }
          addNestedReply(reviews[reviewIndex].adminReplies);
        } else {
          reviews[reviewIndex].adminReplies.push(newReply);
        }
        return res.status(201).json(newReply);
      } else if (action === 'markHelpful') {
        reviews[reviewIndex].helpfulCount += 1;
        return res.status(200).json({ message: 'Marked as helpful' });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in reviews API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
