// Handle fallback routes
export const handleFallbackRoute = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};
