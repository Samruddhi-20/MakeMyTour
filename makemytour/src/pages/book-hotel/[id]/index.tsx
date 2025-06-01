import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { gethotel } from "@/api";
import Loader from "@/components/Loader";
/* Removed import of BookHotelPage as it does not exist or is not needed */
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

const BookHotelPageWithReviews = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await gethotel();
        const filteredData = data.filter((hotel: any) => hotel.id === id);
        setHotels(filteredData);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  const hotel = hotels[0];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ReviewForm
          entityId={hotel?.id}
          entityType="hotel"
          userId={user?.id}
          userName={user?.name}
          onReviewSubmitted={() => {
            // Optionally refresh reviews or update UI
          }}
        />
        <ReviewList
          entityId={hotel?.id}
          entityType="hotel"
          userId={user?.id}
        />
      </div>
    </>
  );
};

export default BookHotelPageWithReviews;
