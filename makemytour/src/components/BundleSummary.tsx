import React from 'react';

interface BundleSummaryProps {
  summary: {
    selectedFlight: any;
    selectedHotel: any;
    selectedTourGuide: any;
    travelers: number;
    discountDetails: {
      bundleDiscountPercent: number;
      groupDiscountPercent: number;
      totalDiscountAmount: number;
      finalPrice: number;
    };
  };
}

const BundleSummary: React.FC<BundleSummaryProps> = ({ summary }) => {
  const {
    selectedFlight,
    selectedHotel,
    selectedTourGuide,
    travelers,
    discountDetails,
  } = summary;

  return (
    <div className="mt-6 p-4 border rounded bg-white shadow-md max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Bundle Summary</h3>
      <div className="space-y-2">
        <div>
          <strong>Flight:</strong> {selectedFlight.flightName} ({selectedFlight.from} → {selectedFlight.to}) - ${selectedFlight.price}
        </div>
        <div>
          <strong>Hotel:</strong> {selectedHotel.hotelName} ({selectedHotel.location}) - ${selectedHotel.pricePerNight} per night
        </div>
        <div>
          <strong>Tour Guide:</strong> {selectedTourGuide.name} - ${selectedTourGuide.pricePerDay} per day
        </div>
        <div>
          <strong>Travelers:</strong> {travelers}
        </div>
      </div>
      <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded">
        <h4 className="font-semibold text-green-700 mb-2">Discounts Applied</h4>
        <p>Bundle Discount: {discountDetails.bundleDiscountPercent}%</p>
        {discountDetails.groupDiscountPercent > 0 && (
          <p>Group Discount: {discountDetails.groupDiscountPercent}%</p>
        )}
        <p className="font-bold mt-2">
          Total Savings: ${discountDetails.totalDiscountAmount.toFixed(2)}
        </p>
      </div>
      <div className="mt-4 text-lg font-bold">
        Final Price: ${discountDetails.finalPrice.toFixed(2)}
      </div>
    </div>
  );
};

export default BundleSummary;
