import DashboardBg from 'assets/img/dashboard.png'
import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import SbomUpload from 'views/Requests/SbomUpload'

import { Box, Image } from '@chakra-ui/react'

const RequestSbomUpload = () => {
  const navRef = useRef()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  return (
    <Box ref={navRef} w='100%' height={'100vh'} position={'relative'}>
      <Image
        src={DashboardBg}
        width={'100%'}
        height={'100%'}
        pos={'absolute'}
      />
      <SbomUpload />
    </Box>
  )
}

export default RequestSbomUpload
