import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface PricePoint {
  timestamp: number;
  price: number;
}

interface PriceGraphProps {
  priceHistory: PricePoint[];
}

const PriceGraph: React.FC<PriceGraphProps> = ({ priceHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = priceHistory.map(point =>
      new Date(point.timestamp).toLocaleDateString()
    );
    const data = priceHistory.map(point => point.price);

    if (chartInstance.current) {
      chartInstance.current.data.labels = labels;
      chartInstance.current.data.datasets[0].data = data;
      chartInstance.current.update();
    } else {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Price History',
              data,
              fill: false,
              borderColor: '#3b82f6', // Tailwind blue-500
              backgroundColor: '#3b82f6',
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Price',
              },
              beginAtZero: false,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
        },
      });
    }

    return () => {
      chartInstance.current?.destroy();
      chartInstance.current = null;
    };
  }, [priceHistory]);

  return <canvas ref={canvasRef} />;
};

export default PriceGraph;
