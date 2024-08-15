import {
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  WarningTwoIcon
} from '@chakra-ui/icons'
import { Box, Button, Flex, Icon, Text, useToast } from '@chakra-ui/react'

import { FaCircleXmark } from 'react-icons/fa6'

const ICON_COLORS = {
  success: '#38A169',
  error: '#E53E3E',
  warning: '#DD6B20',
  info: '#3182CE'
}

const BACKGROUND_COLORS = {
  success: '#EBFBEE',
  error: '#FFF5F5',
  warning: '#FFF9DB',
  info: '#E7F5FF'
}

const TITLE = {
  success: 'Successfull!',
  error: 'Failed!',
  warning: 'Warning!',
  info: 'Information!'
}

const ICON_COMPONENTS = {
  success: <CheckCircleIcon color={ICON_COLORS.success} fontSize='20px' />,
  error: (
    <Icon>
      <FaCircleXmark color={ICON_COLORS.error} fontSize='24px' />
    </Icon>
  ),
  warning: <WarningTwoIcon color={ICON_COLORS.warning} fontSize='20px' />,
  info: <InfoIcon color={ICON_COLORS.info} fontSize='20px' />
}

const getToastStyles = (status) => ({
  backgroundColor: BACKGROUND_COLORS[status] || BACKGROUND_COLORS.info,
  borderLeftColor: ICON_COLORS[status] || ICON_COLORS.info,
  headerName: TITLE[status] || TITLE.info
})

const useCustomToast = () => {
  const toast = useToast()

  const showToast = ({ title, description, status }) => {
    const { backgroundColor, borderLeftColor, headerName } =
      getToastStyles(status)
    const Icon = ICON_COMPONENTS[status] || ICON_COMPONENTS.info

    if (title && !description) {
      description = title
      title = headerName
    } else if (!title && description) {
      title = headerName
    }
    toast({
      duration: 8000,
      isClosable: true,
      position: 'top',
      render: () => (
        <Box
          boxSizing='border-box'
          display='flex'
          alignItems={title && description ? 'baseline' : 'center'}
          justifyContent='space-between'
          padding='10px 12px'
          minWidth='500px'
          background={backgroundColor}
          borderLeft={`2px solid ${borderLeftColor}`}
          borderRadius='8px'
          boxShadow='md'
        >
          <Flex alignItems={title && description ? '' : 'center'}>
            <Box>{Icon}</Box>
            <Box
              marginLeft='12px'
              display='flex'
              flexDirection='column'
              gap={1}
            >
              {title && (
                <Text fontWeight='600' fontSize='16px' color='#1A202C'>
                  {title}
                </Text>
              )}
              {description && (
                <Text fontWeight='300' fontSize='14px' color='#1A202C'>
                  {description}
                </Text>
              )}
            </Box>
          </Flex>
          <Button
            variant='link'
            color={'#1A202C99'}
            onClick={() => toast.closeAll()}
          >
            <CloseIcon fontSize='11px' />
          </Button>
        </Box>
      )
    })
  }

  return { showToast }
}

export default useCustomToast
