export const getDelayColorClass = (delayLabel) => {
  if (!delayLabel || delayLabel === "on time") return "text-green-600";

  if (delayLabel.includes("sec")) return "text-yellow-500";

  if (delayLabel.includes("min")) {
    const min = parseInt(delayLabel);
    if (min > 10) return "text-red-600 font-bold";
    return "text-orange-500";
  }

  return "text-gray-700";
};
