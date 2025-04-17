export const getHealthScore = (score) =>
  score?.includes('NA') ? `N/A` : `${Math.round(score)}%`

export const getTotalHealthScore = (num1, num2, num3) => {
  const scoreOne = num1 === 'NA' ? 0 : Number(Math.round(num1))
  const scoreTwo = num2 === 'NA' ? 0 : Number(Math.round(num2))
  const scoreThree = num3 === 'NA' ? 0 : Number(Math.round(num3))
  return `${Number(scoreOne + scoreTwo + scoreThree)}%`
}
