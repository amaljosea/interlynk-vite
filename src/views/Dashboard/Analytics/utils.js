export const getDays = ({ startDate, endDate }) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0])
  }

  return { dates }
}

const defaultData = {
  licensesCount: 0,
  componentsCount: 0,
  vulnerabilityCount: 0,
  vulnerabilityCriticalCount: 0,
  vulnerabilityHighCount: 0,
  vulnerabilityMediumCount: 0,
  vulnerabilityLowCount: 0,
  vulnerabilityUnknownSevCount: 0,
  averageVulnerabilityDuration: 0
}

export const formatForGraph = ({ nodes, dates }) => {
  const dataForGraph = dates.map((date) => {
    const dateFindInNode = nodes.find((node) => node.date === date)
    if (dateFindInNode) {
      return {
        ...dateFindInNode
      }
    } else {
      return { date, ...defaultData }
    }
  })
  return { dataForGraph }
}
