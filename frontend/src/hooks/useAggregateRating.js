import { useMemo } from "react";

function useAggregateRating(reviews) {
  return useMemo(() => {
    if (!reviews || reviews.length === 0) return { avgRating: 0, total: 0 };

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avgRating = (sum / total).toFixed(1);

    return { avgRating, total };
  }, [reviews]);
}

export default useAggregateRating;
