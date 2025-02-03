import { useNavigate } from 'react-router-dom'

import { Box, Skeleton, Stat, StatLabel, Tooltip } from '@chakra-ui/react'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import Card from './Card/Card'
import CardBody from './Card/CardBody'
import { HealthScore } from './HealthScore'

export const ProgressBar = ({ value, loading, text }) => {
  const navigate = useNavigate()

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const setActiveTab = (value) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: value
      }
    })
    navigate(link)
  }

  const onSelectCheck = () => {
    if (text === 'SBOM Quality Score') {
      setActiveTab('checks')
    }
    return null
  }

  //Different tooltip lables for version and quality scores when the value is zero
  const versionHealthLabel = `${text} is not available`
  const qualityScoreLabel = `Run checks to see ${text}`
  const toolTipLabel =
    value === 0 && text === 'Version Health Score'
      ? versionHealthLabel
      : value === 0 && text === 'SBOM Quality Score'
        ? qualityScoreLabel
        : ''

  return (
    <Card shadow='none' py={0}>
      <CardBody flexDir='column' gap={1}>
        <Stat>
          <StatLabel
            mb={1}
            fontSize='sm'
            fontWeight={'normal'}
            onClick={onSelectCheck}
          >
            {text}
          </StatLabel>
          <Tooltip label={toolTipLabel}>
            {loading ? (
              <Skeleton width={'100%'} height={'22px'} />
            ) : (
              <Box>
                <HealthScore value={value} />
              </Box>
            )}
          </Tooltip>
        </Stat>
      </CardBody>
    </Card>
  )
}
