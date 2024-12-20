import { useQuery } from '@apollo/client'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { Flex, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import IconBox from 'components/Icons/IconBox'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { PolicyResultsType } from 'graphQL/Queries'

const SbomStats = ({ title, amount, icon, status, sbomParts }) => {
  const params = useParams()
  const navigate = useNavigate()
  const signedUrlParams = getSignedUrlParams()
  const { primaryBlueText, secondaryBgColor, primaryTextColor } = useThemeColor(
    ['primaryBlueText', 'secondaryBgColor', 'primaryTextColor']
  )

  const {
    data: policies,
    startPolling,
    stopPolling
  } = useQuery(PolicyResultsType, {
    skip: params?.sbomid ? false : true,
    variables: { sbomId: params?.sbomid, first: 100 }
  })

  const { nodes } = policies?.policyResults || ''
  const isInitialized = nodes?.some((item) => item?.result === 'initialized')
  const policyStatus = isInitialized ? 'IN_PROGRESS' : 'COMPLETED'

  useGradualPolling({ shouldPoll: isInitialized, startPolling, stopPolling })

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { dispatch, setActiveCsSbomTab } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const setActiveTab = (value) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: value
      }
    })
    navigate(link)
  }

  const onSelectComp = () => {
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    if (signedUrlParams) {
      setActiveCsSbomTab(2)
    } else {
      setActiveTab('components')
    }
  }

  const onSelectVulns = () => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    if (signedUrlParams) {
      setActiveCsSbomTab(3)
    } else {
      prodVulnDispatch({
        type: 'FILTER_INCLUDE',
        payload: sbomParts?.length > 0 ? ['parts'] : []
      })
      setActiveTab('vulnerabilities')
    }
  }

  const onSelectLicenses = () => {
    if (signedUrlParams) {
      setActiveCsSbomTab(4)
    } else {
      setActiveTab('licenses')
    }
  }

  const onSelectPolicy = () => {
    if (signedUrlParams) {
      return null
    } else {
      setActiveTab('policies')
    }
  }

  const handleClick = (title) => {
    switch (title) {
      case 'Component':
        onSelectComp()
        break
      case 'Licenses':
        onSelectLicenses()
        break
      case 'Vulnerabilities':
        onSelectVulns()
        break
      case 'Policy Results':
        onSelectPolicy()
        break
      default:
        onSelectComp()
    }
  }

  const onFilterVuln = (value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({
      type: 'FILTER_INCLUDE',
      payload: sbomParts?.length > 0 ? ['parts'] : []
    })
    if (signedUrlParams) {
      setActiveCsSbomTab(3)
    } else {
      setActiveTab('vulnerabilities')
    }
  }

  return (
    <Card width='100%' h={'97px'}>
      <CardBody>
        <Flex width={'100%'} gap={3} align='center'>
          <IconBox h={12} w={12} color={primaryBlueText} bg={secondaryBgColor}>
            {icon}
          </IconBox>
          <Stat>
            <StatLabel
              w={'fit-content'}
              onClick={() => handleClick(title)}
              sx={{ mb: 1, fontSize: 'md', cursor: 'pointer' }}
            >
              {title}
            </StatLabel>
            {title === 'Vulnerabilities' ? (
              <SimpleGrid gap={1} width={'100%'} columns={5}>
                <VulnBadge
                  color='red'
                  label='Critical'
                  status={status}
                  onClick={() => onFilterVuln(['critical'])}
                >
                  {status === 'NOT_STARTED' ? '-' : amount?.critical || 0}
                </VulnBadge>
                <VulnBadge
                  color='orange'
                  label='High'
                  status={status}
                  onClick={() => onFilterVuln(['high'])}
                >
                  {status === 'NOT_STARTED' ? '-' : amount?.high || 0}
                </VulnBadge>
                <VulnBadge
                  color='yellow'
                  label='Medium'
                  status={status}
                  onClick={() => onFilterVuln(['medium'])}
                >
                  {status === 'NOT_STARTED' ? '-' : amount?.medium || 0}
                </VulnBadge>
                <VulnBadge
                  color='green'
                  label='Low'
                  status={status}
                  onClick={() => onFilterVuln(['low'])}
                >
                  {status === 'NOT_STARTED' ? '-' : amount?.low || 0}
                </VulnBadge>
                <VulnBadge
                  color='gray'
                  label='Unknown'
                  status={status}
                  onClick={() => onFilterVuln(['unknown'])}
                >
                  {status === 'NOT_STARTED' ? '-' : amount?.unknown || 0}
                </VulnBadge>
              </SimpleGrid>
            ) : title === 'Policy Results' ? (
              <SimpleGrid gap={1} width={'100%'} columns={6}>
                <VulnBadge color='red' status={policyStatus} label='Fail'>
                  {amount?.failedCount || 0}
                </VulnBadge>
                <VulnBadge color='yellow' status={policyStatus} label='Warn'>
                  {amount?.warnCount || 0}
                </VulnBadge>
                <VulnBadge color='blue' status={policyStatus} label='Inform'>
                  {amount?.informCount || 0}
                </VulnBadge>
                <VulnBadge color='green' status={policyStatus} label='Pass'>
                  {amount?.passedCount || 0}
                </VulnBadge>
                <VulnBadge color='gray' status={policyStatus} label='Skipped'>
                  {amount?.skippedCount || 0}
                </VulnBadge>
                <VulnBadge color='orange' status={policyStatus} label='Error'>
                  {amount?.errorCount || 0}
                </VulnBadge>
              </SimpleGrid>
            ) : (
              <StatNumber fontSize='lg' color={primaryTextColor}>
                {amount || 0}
              </StatNumber>
            )}
          </Stat>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default SbomStats
