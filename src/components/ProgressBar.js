import { useNavigate } from 'react-router-dom'

import {
  Box,
  Stat,
  StatLabel,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import Card from './Card/Card'
import CardBody from './Card/CardBody'

export const ProgressBar = ({ value, loading, text }) => {
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.100', 'gray.600')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

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
            <Box
              mt={0.5}
              height={'18px'}
              width={'100%'}
              overflow={'hidden'}
              position='relative'
              borderLeftRadius={'md'}
              borderRightRadius={'md'}
              display='inline-block'
            >
              <Box
                height={'100%'}
                width={'100%'}
                position={'absolute'}
                borderLeftRadius={'md'}
                borderRightRadius={'md'}
                sx={{
                  background:
                    'linear-gradient(90deg, rgba(245,101,101,1) 0%, rgba(236,201,75,1) 50%, rgba(72,187,120,1) 100%)'
                }}
              />
              <Box
                right={0}
                pos={'absolute'}
                height={'100%'}
                bg={bgColor}
                width={value === 0 ? '100%' : `${100 - Math.round(value)}%`}
              />
              <Box
                top='0'
                left='0'
                width='100%'
                height='100%'
                display='flex'
                fontSize={'xs'}
                alignItems='center'
                fontWeight='medium'
                position='absolute'
                justifyContent='center'
              >
                <Text color={textColor}>
                  {loading
                    ? `Loading...`
                    : value === 0
                      ? 'N/A'
                      : `${Math.round(value)} %`}
                </Text>
              </Box>
            </Box>
          </Tooltip>
        </Stat>
      </CardBody>
    </Card>
  )
}
