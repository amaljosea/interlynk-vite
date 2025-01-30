export const getDays = ({ startDate, endDate }) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0])
  }

  return { dates }
}

export const formatDate = (date, timeZone = 'UTC') => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone
  })
}

export const formatForGraph = ({ nodes, dates }) => {
  const dataForGraph = dates?.map((date) => {
    // Filter nodes matching the current date
    const nodesForDate = nodes?.filter((node) => node.date === date)

    if (nodesForDate?.length > 0) {
      // Aggregate data from all matching nodes
      const aggregatedData = nodesForDate.reduce(
        (acc, node) => {
          return {
            componentsCount: acc.componentsCount + node.componentsCount,
            licensesCount: acc.licensesCount + node.licensesCount,
            policiesCount: acc.policiesCount + node.policiesCount,
            policyResultDetectedCount:
              acc.policyResultDetectedCount + node.policyResultDetectedCount,
            policyResultErrorCount:
              acc.policyResultErrorCount + node.policyResultErrorCount,
            policyResultNotDetectedCount:
              acc.policyResultNotDetectedCount +
              node.policyResultNotDetectedCount,
            policyResultPassedCount:
              acc.policyResultPassedCount + node.policyResultPassedCount,
            policyRuleViolationFailCount:
              acc.policyRuleViolationFailCount +
              node.policyRuleViolationFailCount,
            policyRuleViolationInformCount:
              acc.policyRuleViolationInformCount +
              node.policyRuleViolationInformCount,
            policyRuleViolationPassCount:
              acc.policyRuleViolationPassCount +
              node.policyRuleViolationPassCount,
            policyRuleViolationWarnCount:
              acc.policyRuleViolationWarnCount +
              node.policyRuleViolationWarnCount,
            policyViolationsCount:
              acc.policyViolationsCount + node.policyViolationsCount,
            vulnerabilityAffectedCount:
              acc.vulnerabilityAffectedCount + node.vulnerabilityAffectedCount,
            vulnerabilityCount:
              acc.vulnerabilityCount + node.vulnerabilityCount,
            vulnerabilityCriticalCount:
              acc.vulnerabilityCriticalCount + node.vulnerabilityCriticalCount,
            vulnerabilityFixedCount:
              acc.vulnerabilityFixedCount + node.vulnerabilityFixedCount,
            vulnerabilityHighCount:
              acc.vulnerabilityHighCount + node.vulnerabilityHighCount,
            vulnerabilityInTriageCount:
              acc.vulnerabilityInTriageCount + node.vulnerabilityInTriageCount,
            vulnerabilityLowCount:
              acc.vulnerabilityLowCount + node.vulnerabilityLowCount,
            vulnerabilityMediumCount:
              acc.vulnerabilityMediumCount + node.vulnerabilityMediumCount,
            vulnerabilityNotAffectedCount:
              acc.vulnerabilityNotAffectedCount +
              node.vulnerabilityNotAffectedCount,
            vulnerabilityUnknownSevCount:
              acc.vulnerabilityUnknownSevCount +
              node.vulnerabilityUnknownSevCount,
            vulnerabilityUnspecifiedCount:
              acc.vulnerabilityUnspecifiedCount +
              node.vulnerabilityUnspecifiedCount,
            averageVulnerabilityDuration:
              acc.averageVulnerabilityDuration +
              node.averageVulnerabilityDuration,
            policyResultSkippedCount:
              acc.policyResultSkippedCount + node.policyResultSkippedCount
          }
        },
        // Initialize all fields to 0 for aggregation
        {
          componentsCount: 0,
          licensesCount: 0,
          policiesCount: 0,
          policyResultDetectedCount: 0,
          policyResultErrorCount: 0,
          policyResultNotDetectedCount: 0,
          policyResultPassedCount: 0,
          policyRuleViolationFailCount: 0,
          policyRuleViolationInformCount: 0,
          policyRuleViolationPassCount: 0,
          policyRuleViolationWarnCount: 0,
          policyViolationsCount: 0,
          vulnerabilityAffectedCount: 0,
          vulnerabilityCount: 0,
          vulnerabilityCriticalCount: 0,
          vulnerabilityFixedCount: 0,
          vulnerabilityHighCount: 0,
          vulnerabilityInTriageCount: 0,
          vulnerabilityLowCount: 0,
          vulnerabilityMediumCount: 0,
          vulnerabilityNotAffectedCount: 0,
          vulnerabilityUnknownSevCount: 0,
          vulnerabilityUnspecifiedCount: 0,
          averageVulnerabilityDuration: 0,
          policyResultSkippedCount: 0
        }
      )

      return { date, ...aggregatedData }
    } else {
      // If no matching nodes, return just the date
      return { date }
    }
  })

  return { dataForGraph }
}
