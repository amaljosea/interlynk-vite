import { gql, useQuery } from '@apollo/client'
import { TourProvider } from '@reactour/tour'
import NotFound from 'assets/svg/not-found.svg'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { customerRoutes } from 'routes'
import { displayErrorMessage } from 'utils'

import { Box, Center, Flex, Img, Text, useColorMode } from '@chakra-ui/react'

// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6'

// Custom components
import { getActiveNavbar, getActiveRoute, tourStyles } from '../utils'

export const getSharelynk = gql`
  query getSharelynk($id: Uuid!) {
    shareLynkQuery {
      projectGroup(id: $id) {
        name
      }
    }
  }
`

export default function Customer() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const sbomId = params.sbomid
  const queryParams = new URLSearchParams(location.search)
  const signedUrlParams = queryParams.get('signed_url_params')
  const tabRes = window.matchMedia('(max-width: 1199px)')

  const { colorMode } = useColorMode()
  const { generateProductVersionDetailPageUrlFromCurrentUrl: genUrl } =
    useProductUrlContext()

  document.documentElement.dir = 'ltr'

  const onTourUpdate = (value) => {
    localStorage.setItem('tourCompleted', true)
    document?.body?.classList.remove('no-scroll')
    value.setIsOpen(false)
  }

  const steps = [
    {
      selector: '.welcome',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Welcome to the Share Lynk
          </Text>
          <Text>
            Interlynk’s Share Lynk is the ultimate solution for sharing a
            product’s software composition using SBOM and vulnerability
            exploitability using VEX
          </Text>
          <Text>
            Let’s guide you through the essential features that will help you
            utilize this Share Lynk effectively
          </Text>
        </Flex>
      )
    },
    {
      selector: '.product_details',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Product Details
          </Text>
          <Text>
            This Share Lynk is live and uniquely connected to this Product, and
            any product, description, or version changes will be automatically
            reflected here.
          </Text>
        </Flex>
      )
    },
    {
      selector: '.versions',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Versions
          </Text>
          <Text>
            This table lists all versions of the product included in the Share
            Lynk.
          </Text>
          <Text>
            The columns Components, Licenses, and Vulnerabilities summarize the
            version’s details, and status represents the state of the most
            recent SBOM for that version.
          </Text>
          <Text>
            <strong>Click on a version to continue.</strong>
          </Text>
        </Flex>
      )
    },
    {
      selector: '.version',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Version
          </Text>
          <Text>
            This view details a single version as represented by its most recent
            SBOM. The top card summarizes associated counts, while the bottom
            section provides details and search and filter controls to narrow
            the details.
          </Text>
        </Flex>
      )
    },
    {
      selector: '.general',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            General Tab
          </Text>
          <Text>
            The General tab lists metadata associated with the SBOM, including
            details of its creation, supplier, and license associated with using
            SBOM data.
          </Text>
        </Flex>
      )
    },
    {
      selector: '.components',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Components Tab
          </Text>
          <Text>
            The Components tab lists all included components and can be searched
            for direct dependencies as well as components with specific names,
            licenses, or identifiers (CPE or PURL).
          </Text>
        </Flex>
      )
    },
    {
      selector: '.vulnerabilities',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Vulnerabilities Tab
          </Text>
          <Text>
            The Vulnerabilities tab lists all vulnerabilities detected against
            the version using SBOM.
          </Text>
          <Text>
            For each vulnerability, the tab also includes the status of the
            vulnerability as declared by the owner.
          </Text>
        </Flex>
      )
    },
    {
      selector: '.licenses',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Licenses Tab
          </Text>
          <Text>
            The licenses tab lists all applicable licenses and the components
            that include those licenses.
          </Text>
        </Flex>
      )
    },
    {
      selector: '.search-version',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Other Versions
          </Text>
          <Text>
            To quickly switch to another version of the same product, use the
            “Search Versions” control.
          </Text>
        </Flex>
      )
    },
    {
      selector: '.download',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Download
          </Text>
          <Text>
            The download button allows access to the underlying SBOM in
            CyclnoneDX and SPDX specifications.
          </Text>
          <Text>
            Download can optionally include vulnerability status using VEX.
          </Text>
        </Flex>
      )
    },
    {
      selector: '.signup',
      content: (
        <Flex flexDir={'column'} gap={2}>
          <Text fontSize={16} fontWeight={'semibold'}>
            Sign Up
          </Text>
          <Text>
            Create a free account with Interlynk to save and have all your Share
            Lynks from one place.
          </Text>
          <Text>
            You can also use your account to upload your own SBOM, run
            additional analysis, and create your own Share Lynks.
          </Text>
        </Flex>
      )
    }
  ]

  const onNavigate = (step) => {
    if (step === 4) {
      const link = genUrl({ paramsObj: { tab: 'general' } })
      navigate(link)
    } else if (step === 5) {
      const link = genUrl({ paramsObj: { tab: 'components' } })
      navigate(link)
    } else if (step === 6) {
      const link = genUrl({ paramsObj: { tab: 'vulnerabilities' } })
      navigate(link)
    } else if (step === 7) {
      const link = genUrl({ paramsObj: { tab: 'licenses' } })
      navigate(link)
    } else if (step === 10) {
      localStorage.setItem('tourCompleted', true)
    }
  }

  const onClickPrev = (props) => {
    const { currentStep, setCurrentStep } = props
    setCurrentStep(currentStep - 1)
    onNavigate(currentStep - 1)
  }

  const onClickNext = (props) => {
    const { currentStep, setCurrentStep } = props
    setCurrentStep(currentStep + 1)
    onNavigate(currentStep + 1)
  }

  const onClickDone = (props) => {
    document?.body?.classList.remove('no-scroll')
    onClickNext(props)
  }

  const { data, error } = useQuery(getSharelynk, {
    skip: params.productgroupid && signedUrlParams ? false : true,
    variables: { id: params.productgroupid },
    onCompleted: (data) => {
      if (data?.shareLynkQuery?.productGroup) {
        sessionStorage.setItem('signedUrlParams', signedUrlParams)
      }
    }
  })

  if (data?.shareLynkQuery === null || error)
    return (
      <Center as={Flex} flexDir={'column'} h={'100vh'}>
        <Text fontSize='3xl' fontWeight={'semibold'} color={'#3182CE'}>
          Invalid Request
        </Text>
        <Text mt={2}>
          This looks like an Interlynk Share Lynk address but does not match any
          shared product.
        </Text>
        <Text>
          Please recheck or ask the sender to re-share the link address.
        </Text>
        <Img src={NotFound} width={'36%'} />
      </Center>
    )

  return (
    <TourProvider
      steps={steps}
      styles={tourStyles}
      nextButton={(props) =>
        props?.currentStep === 2 ? null : props?.currentStep === 10 ? (
          <Text cursor={'pointer'} onClick={() => onClickDone(props)}>
            Done
          </Text>
        ) : (
          <FaArrowRight cursor={'pointer'} onClick={() => onClickNext(props)} />
        )
      }
      prevButton={(props) =>
        sbomId && props?.currentStep === 3 ? null : (
          <FaArrowLeft cursor={'pointer'} onClick={() => onClickPrev(props)} />
        )
      }
      onClickClose={(value) => onTourUpdate(value)}
      onClickMask={(value) => onTourUpdate(value)}
    >
      <Flex
        sx={{
          w: '100%',
          bg: 'rgba(0,0,0,0.04)',
          gap: 0,
          alignItems: 'flex-start'
        }}
      >
        <Box pos={'sticky'} top={0}>
          <Sidebar routes={customerRoutes} />
        </Box>
        <Flex width={'100%'} flexDir={'column'}>
          <Box
            sx={{ top: 0, zIndex: 111, pos: 'sticky' }}
            bg={colorMode === 'light' ? 'white' : 'gray.900'}
            borderBottom={`1px solid ${colorMode === 'light' ? '#E2E8F0' : '#1A202C'}`}
          >
            <AdminNavbar
              tabRes={tabRes}
              brandText={getActiveRoute(customerRoutes)}
              secondary={getActiveNavbar(customerRoutes)}
            />
          </Box>
          <Box sx={{ my: 6, px: 6 }}>
            <Outlet />
          </Box>
        </Flex>
      </Flex>
    </TourProvider>
  )
}
