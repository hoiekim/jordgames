/**
 * This color map should contain color names that are associated with CSS variables.
 * For color details, find "variables.css" in this project.
 */
export const colorMap = [
  "lightYellow",
  "lightRed",
  "lightPurple",
  "lightGreen",
  "lightOrange",
];

export const getColor = (colorCode: number) => {
  return colorMap[colorCode];
};
