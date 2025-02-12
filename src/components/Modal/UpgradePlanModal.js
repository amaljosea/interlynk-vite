import { useMutation } from '@apollo/client'
import { Fragment } from 'react'
import { upgradePlanAllFeatures } from 'variables/general'

import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Icon,
  SimpleGrid,
  Text,
  /* eslint-disable */
  useColorModeValue
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { EnterpriseUpgradeRequest } from 'graphQL/Mutation'

import { GiScales } from 'react-icons/gi'

export const UpgradePlanModal = ({ isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [sendRequest, { loading }] = useMutation(EnterpriseUpgradeRequest)
  const {
    primaryBgColor,
    primaryErrorColor,
    primarySuccessColor,
    primaryBlueText,
    secondaryTextInverse
  } = useThemeColor([
    'primaryBgColor',
    'primaryErrorColor',
    'primarySuccessColor',
    'primaryBlueText',
    'secondaryTextInverse'
  ])
  const handleContact = () => {
    sendRequest().then((res) => {
      if (res?.data?.enterpriseUpgradeRequest?.success) {
        showToast({
          description:
            'A support request has been created for you. We will contact you within 2-business days.',
          status: 'success'
        })
        onClose()
      }
    })
  }

  const BalanceIconComponent = () => {
    return <Icon as={GiScales} boxSize={6} color={secondaryTextInverse} />
  }

  const boxShadow = useColorModeValue(
    '0px 4px 16px rgba(0, 0, 0, 0.1)',
    '0px 2px 8px rgba(0, 0, 0, 0.3)'
  )

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={loading}
      onSubmit={handleContact}
      title='Upgrade to Enterprise Plan'
      buttonText='Contact Us'
      buttonColor='blue'
      maxW='800px'
      maxH='700px'
      Icon={BalanceIconComponent}
    >
      {/* Main Grid Layout with Three Columns */}
      <SimpleGrid
        columns={3}
        spacing={4}
        maxH={'500px'}
        overflowY={'scroll'}
        css={{
          '&::-webkit-scrollbar': {
            display: 'none' // Hides the scrollbar in WebKit browsers (Chrome, Safari)
          },
          scrollbarWidth: 'none' // Hides the scrollbar in Firefox
        }}
        paddingTop={'10px'}
        paddingBottom={'20px'}
      >
        {/* Left Column: Feature Names and Titles */}
        <Box p={4} w={'400px'}>
          <Text
            fontSize='md'
            fontWeight='semibold'
            mb={2}
            h='30px'
            textTransform={'uppercase'}
          >
            {''}
          </Text>
          {upgradePlanAllFeatures.map((featureSet, featureIndex) => (
            <Fragment key={featureIndex}>
              {/* Feature Set Title */}
              <Text
                fontSize='md'
                fontWeight='semibold'
                mb={1}
                mt={'20px'}
                h='30px'
                color={primaryBlueText}
              >
                {featureSet.title}
              </Text>

              {/* Feature Names */}
              {featureSet.features.map((item, index) => (
                <Text
                  key={index}
                  mb={2}
                  display='flex'
                  alignItems='center'
                  h='30px'
                  fontSize='sm'
                  fontWeight='normal'
                >
                  {item.feature}
                </Text>
              ))}
            </Fragment>
          ))}
        </Box>

        {/* Center Column: Free Plan Values */}
        <Box
          p={4}
          display='flex'
          flexDirection={'column'}
          alignItems={'center'}
        >
          <Text
            fontSize='md'
            fontWeight='normal'
            mb={2}
            h='30px'
            color={secondaryTextInverse}
            textTransform={'uppercase'}
          >
            {'Free'}
          </Text>
          {upgradePlanAllFeatures.map((featureSet, featureIndex) => (
            <Fragment key={featureIndex}>
              <Text
                fontSize='md'
                fontWeight='semibold'
                mb={'5px'}
                mt={'10px'}
                h='30px'
              >
                {' '}
              </Text>
              {featureSet.features.map((item, index) => (
                <Text
                  key={index}
                  mb={2}
                  textAlign='center'
                  display='flex'
                  alignItems='center'
                  h='30px'
                  color={
                    typeof item.val1 === 'boolean'
                      ? item.val1
                        ? primarySuccessColor
                        : primaryErrorColor
                      : 'inherit'
                  }
                >
                  {typeof item.val1 === 'boolean' ? (
                    item.val1 ? (
                      <CheckCircleIcon />
                    ) : (
                      <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        bg={primaryErrorColor}
                        borderRadius='full'
                        width='16px'
                        height='16px'
                      >
                        <CloseIcon color={primaryBgColor} boxSize='8px' />
                      </Box>
                    )
                  ) : (
                    item.val1
                  )}
                </Text>
              ))}
            </Fragment>
          ))}
        </Box>

        {/* Right Column: Enterprise Plan Values */}
        <Box
          borderRadius={'10px'}
          p={4}
          w={'240px'}
          display='flex'
          flexDirection={'column'}
          alignItems={'center'}
          boxShadow={boxShadow}
        >
          <Text
            fontSize='md'
            fontWeight='semibold'
            mb={2}
            h='30px'
            color={primaryBlueText}
            textTransform={'uppercase'}
          >
            {'Enterprise'}
          </Text>
          {upgradePlanAllFeatures.map((featureSet, featureIndex) => (
            <Fragment key={featureIndex}>
              <Text
                fontSize='md'
                fontWeight='semibold'
                mb={'5px'}
                mt={'9px'}
                h='30px'
              >
                {''}
              </Text>
              {featureSet.features.map((item, index) => (
                <Text
                  key={index}
                  mb={2}
                  textAlign='center'
                  display='flex'
                  alignItems='center'
                  h='30px'
                  color={
                    typeof item.val2 === 'boolean'
                      ? item.val2
                        ? primarySuccessColor
                        : primaryErrorColor
                      : 'inherit'
                  }
                >
                  {typeof item.val2 === 'boolean' ? (
                    item.val2 ? (
                      <CheckCircleIcon />
                    ) : (
                      <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        bg={primaryErrorColor}
                        borderRadius='full'
                        width='16px'
                        height='16px'
                      >
                        <CloseIcon color={primaryBgColor} boxSize='8px' />
                      </Box>
                    )
                  ) : (
                    item.val2
                  )}
                </Text>
              ))}
            </Fragment>
          ))}
        </Box>
      </SimpleGrid>
    </LynkModal>
  )
}
