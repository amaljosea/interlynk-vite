/* eslint-disable */
// only allowed to import useToast here
// eslint-disable-next-line no-restricted-imports
import { InfoIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Text, useToast } from '@chakra-ui/react'

import { LuCircleAlert, LuCircleCheck, LuCircleX, LuX } from 'react-icons/lu'

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
  success: 'Successful!',
  error: 'Failed!',
  warning: 'Warning!',
  info: 'Information!'
}

const ICON_COMPONENTS = {
  success: <LuCircleCheck color={ICON_COLORS.success} size={20} />,
  error: <LuCircleX color={ICON_COLORS.error} size={20} />,
  warning: <LuCircleAlert color={ICON_COLORS.warning} size={20} />,
  info: <InfoIcon color={ICON_COLORS.info} size={20} />
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
          alignItems={title && description ? 'flex-start' : 'center'}
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
            size={'xs'}
            variant='link'
            title='Close toast'
            color={'#1A202C99'}
            onClick={() => toast.closeAll()}
          >
            <LuX size={18} />
          </Button>
        </Box>
      )
    })
  }

  return { showToast }
}

export default useCustomToast
