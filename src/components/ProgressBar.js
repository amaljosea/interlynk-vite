import { useNavigate } from 'react-router-dom'

import { Skeleton, Stat, StatLabel, Tooltip } from '@chakra-ui/react'

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

  return (
    <Card shadow='none'>
      <CardBody flexDir='column' gap={1}>
        <Stat>
          <StatLabel
            mb={1}
            fontSize='sm'
            cursor={'pointer'}
            fontWeight={'normal'}
            onClick={onSelectCheck}
          >
            {text}
          </StatLabel>
          <Tooltip
            label={value === 0 ? `Run checks to see Quality Score.` : ''}
          >
            {loading ? (
              <Skeleton width={'100%'} height={4} borderRadius={'md'} />
            ) : (
              <HealthScore value={value} />
            )}
          </Tooltip>
        </Stat>
      </CardBody>
    </Card>
  )
}
