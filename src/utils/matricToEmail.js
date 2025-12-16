// src/utils/matricToEmail.js
export const matricToEmail = (matric) => {
  return matric.replace(/\//g, "").toLowerCase() + "@questvault.com";
};
