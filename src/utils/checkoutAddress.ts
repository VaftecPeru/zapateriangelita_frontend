export const getSuggestedCity = (
  cities: string[],
  currentCity: string,
): string | null => {
  if (currentCity.trim() || cities.length !== 1) return null;
  return cities[0] || null;
};

export const isValidMexicoPostalCode = (postalCode: string) =>
  /^\d{5}$/.test(postalCode.trim());

export const isValidColony = (colony: string) => {
  const value = colony.trim();
  return value.length >= 2 && value.length <= 120;
};
