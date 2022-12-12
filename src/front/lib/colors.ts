/**
 * This color map should contain color names that are associated with CSS variables.
 * For color details, find "variables.css" in this project.
 */
export const colorMap = [
  ["darkYellow", "darkRed", "darkPurple", "darkGreen", "darkOrange", "darkBlue"],
  ["yellow", "red", "purple", "green", "orange", "blue"],
  ["lightYellow", "lightRed", "lightPurple", "lightGreen", "lightOrange", "lightBlue"],
];

export const getColor = (colorCode: number, brightness: number) => {
  return colorMap[brightness][colorCode];
};
