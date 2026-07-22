import { useState, useEffect } from "react";

export function useRealTimeAvailability(classId: string, initialSpots: number) {
  const [availableSpots, setAvailableSpots] = useState(initialSpots);

  useEffect(() => {
    // Simulate real-time availability updates
    const interval = setInterval(() => {
      // Random chance to decrease availability (simulating bookings)
      if (Math.random() < 0.1 && availableSpots > 0) {
        setAvailableSpots(prev => Math.max(0, prev - 1));
      }
      // Random chance to increase availability (simulating cancellations)
      else if (Math.random() < 0.05 && availableSpots < initialSpots) {
        setAvailableSpots(prev => Math.min(initialSpots, prev + 1));
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [classId, availableSpots, initialSpots]);

  return { availableSpots };
}
