import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { getToken } from '../../utils/auth';

type Review = {
  id: number;
  shop: string;
  user: string;
  stars: number;
  comment: string;
  created_at: string;
};

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch('http://localhost:8000/api/reviews/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar 
            key={i} 
            className="text-yellow-500" 
            aria-hidden="true" 
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt 
            key={i} 
            className="text-yellow-500" 
            aria-hidden="true" 
          />
        );
      } else {
        stars.push(
          <FaRegStar 
            key={i} 
            className="text-yellow-500" 
            aria-hidden="true" 
          />
        );
      }
    }

    return (
      <div className="flex" aria-label={`Rating: ${rating} out of 5 stars`}>
        {stars}
        <span className="sr-only">{rating} out of 5 stars</span>
      </div>
    );
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Reviews</h1>

      {reviews.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-6" aria-live="polite" aria-atomic="true">
          {reviews.map((review) => (
            <article 
              key={review.id} 
              className="bg-white p-6 rounded-lg shadow-md"
              aria-labelledby={`review-${review.id}-title`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 
                    id={`review-${review.id}-title`}
                    className="text-lg font-semibold text-gray-800"
                  >
                    {review.shop}
                  </h2>
                  <p className="text-sm text-gray-500">By {review.user}</p>
                </div>
                <div className="flex items-center">
                  {renderStars(review.stars)}
                  <span className="ml-2 text-gray-700 sr-only">
                    ({review.stars.toFixed(1)})
                  </span>
                  <span aria-hidden="true" className="ml-2 text-gray-700">
                    {review.stars.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-gray-600">{review.comment}</p>
              <time 
                dateTime={review.created_at} 
                className="mt-2 text-sm text-gray-400"
              >
                Posted on {new Date(review.created_at).toLocaleDateString()}
              </time>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;