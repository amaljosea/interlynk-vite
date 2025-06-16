const METRIC_NAMES = {
  AV: 'Attack Vector',
  AC: 'Attack Complexity',
  AT: 'Attack Requirements',
  PR: 'Privileges Required',
  UI: 'User Interaction',
  VC: 'Confidentiality Impact',
  VI: 'Integrity Impact',
  VA: 'Availability Impact',
  SC: 'Confidentiality Scope',
  SI: 'Integrity Scope',
  SA: 'Availability Scope',
  S: 'Scope',
  C: 'Confidentiality',
  I: 'Integrity',
  A: 'Availability',
  AU: 'Authentication',
  E: 'Exploit Code Maturity',
  CR: 'Confidentiality Requirement',
  IR: 'Integrity Requirement',
  AR: 'Availability Requirement',
  MAV: 'Modified Attack Vector',
  MAC: 'Modified Attack Complexity',
  MAT: 'Modified Attack Requirements',
  MPR: 'Modified Privileges Required',
  MUI: 'Modified User Interaction',
  MVC: 'Modified Confidentiality Impact',
  MVI: 'Modified Integrity Impact',
  MVA: 'Modified Availability Impact',
  MSC: 'Modified Confidentiality Scope',
  MSI: 'Modified Integrity Scope',
  MSA: 'Modified Availability Scope',
  R: 'Report Confidence',
  V: 'Vulnerability Response Level',
  RE: 'Remediation Level',
  U: 'Utility'
}

const CVSS_METRIC_MAPS = {
  '2.0': {
    AV: { L: 'Local', A: 'Adjacent Network', N: 'Network' },
    AC: { H: 'High', M: 'Medium', L: 'Low' },
    AU: { N: 'None', S: 'Single', M: 'Multiple' },
    C: { N: 'None', P: 'Partial', C: 'Complete' },
    I: { N: 'None', P: 'Partial', C: 'Complete' },
    A: { N: 'None', P: 'Partial', C: 'Complete' }
  },
  '3.0': {
    AV: { N: 'Network', A: 'Adjacent', L: 'Local', P: 'Physical' },
    AC: { L: 'Low', H: 'High' },
    PR: { N: 'None', L: 'Low', H: 'High' },
    UI: { N: 'None', R: 'Required' },
    S: { U: 'Unchanged', C: 'Changed' },
    C: { H: 'High', L: 'Low', N: 'None' },
    I: { H: 'High', L: 'Low', N: 'None' },
    A: { H: 'High', L: 'Low', N: 'None' }
  },
  3.1: {},
  '4.0': {
    AV: { N: 'Network', A: 'Adjacent', L: 'Local', P: 'Physical' },
    AC: { L: 'Low', H: 'High' },
    AT: { N: 'None', P: 'Present' },
    PR: { N: 'None', L: 'Low', H: 'High' },
    UI: { N: 'None', R: 'Required' },
    VC: { H: 'High', L: 'Low', N: 'None' },
    VI: { H: 'High', L: 'Low', N: 'None' },
    VA: { H: 'High', L: 'Low', N: 'None' },
    SC: { Y: 'Changed', N: 'None' },
    SI: { Y: 'Changed', N: 'None' },
    SA: { Y: 'Changed', N: 'None' },
    E: {
      X: 'Not Defined',
      U: 'Unproven',
      P: 'Proof-of-Concept',
      F: 'Functional',
      H: 'High'
    },
    CR: { X: 'Not Defined', L: 'Low', M: 'Medium', H: 'High' },
    IR: { X: 'Not Defined', L: 'Low', M: 'Medium', H: 'High' },
    AR: { X: 'Not Defined', L: 'Low', M: 'Medium', H: 'High' },
    MAV: {
      X: 'Not Defined',
      N: 'Network',
      A: 'Adjacent',
      L: 'Local',
      P: 'Physical'
    },
    MAC: { X: 'Not Defined', L: 'Low', H: 'High' },
    MAT: { X: 'Not Defined', N: 'None', P: 'Present' },
    MPR: { X: 'Not Defined', N: 'None', L: 'Low', H: 'High' },
    MUI: { X: 'Not Defined', N: 'None', R: 'Required' },
    MVC: { X: 'Not Defined', H: 'High', L: 'Low', N: 'None' },
    MVI: { X: 'Not Defined', H: 'High', L: 'Low', N: 'None' },
    MVA: { X: 'Not Defined', H: 'High', L: 'Low', N: 'None' },
    MSC: { X: 'Not Defined', Y: 'Changed', N: 'None' },
    MSI: { X: 'Not Defined', Y: 'Changed', N: 'None' },
    MSA: { X: 'Not Defined', Y: 'Changed', N: 'None' },
    R: { X: 'Not Defined', U: 'Unknown', P: 'Partial', C: 'Complete' },
    V: { X: 'Not Defined', N: 'None', P: 'Partial', C: 'Complete' },
    RE: {
      X: 'Not Defined',
      O: 'Official fix',
      T: 'Temporary fix',
      W: 'Workaround',
      U: 'Unavailable'
    },
    U: {
      X: 'Not Defined',
      A: 'Automatable',
      L: 'Limited',
      M: 'Moderate',
      H: 'High'
    }
  }
}

export const parseCvssVector = (vector) => {
  const versionMatch = vector.match(/^CVSS:(\d\.\d)/)
  const version = versionMatch?.[1] ?? 'unknown'
  const metrics = vector.replace(/^CVSS:\d\.\d\//, '').split('/')
  const map = {
    ...CVSS_METRIC_MAPS[version],
    ...(version === '3.1' ? CVSS_METRIC_MAPS['3.0'] : {})
  }

  const parsed = metrics.map((metric) => {
    const [key, value] = metric.split(':')
    return {
      key,
      name: METRIC_NAMES[key] || key,
      value: map?.[key]?.[value] ?? value
    }
  })

  return { version, parsed }
}
