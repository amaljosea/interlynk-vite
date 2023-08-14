import {
  Stack,
  Tag,
  Badge,
  Button,
  IconButton,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Skeleton,
  TagLeftIcon,
  TagCloseButton,
  TagLabel,
  Icon,
  Input,
  InputGroup,
  Switch,
  useDisclosure,
  Tooltip,
  FormLabel,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Portal,
  useClipboard
} from '@chakra-ui/react'
import React, { useState, useContext, useEffect } from 'react'
import { productVersionsData } from 'variables/general'
import {
  FaBalanceScale,
  FaCubes,
  FaEllipsisV,
  FaBug,
  FaEyeSlash
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import ProductLinkDrawer from 'components/Drawer/ProductLinkDrawer'
import { timeSince } from 'utils'

function ShareLynkRow(props) {
  const {
    SBOMLinksData,
    setSBOMLinksData,
    componentsVal,
    VulnerabilitiesVal,
    activeVulnVal,
    riskScoreVal
  } = useContext(GlobalContext)
  const {
    id,
    link,
    visits,
    active,
    created,
    components,
    licenses,
    vulnerabilities,
    shared_with,
    redactions,
    cyclonedx,
    spdx
  } = props
  const textColor = useColorModeValue('gray.700', 'white')
  const bgStatus = useColorModeValue('gray.400', '#1a202c')
  const colorStatus = useColorModeValue('white', 'gray.400')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const uniqProjects = []
  const btnRef = React.useRef()

  const [checked, setChecked] = useState(false)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('p')
  const version = queryParams.get('v')

  const customerId = link.split('/')

  const domain = window.location.origin

  const sbomLink = useClipboard(`${domain}/sharelynk?p=${product}&v=${version}`)

  // `https://dashboard-app.fly.dev/#/customer/sboms/${customerId[7]}`

  // `http://localhost/#/customer/sboms/${customerId[7]}`

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })

  const uniqVersions = []
  productVersionsData.map((project) => {
    project.versions.map((version) => {
      if (uniqVersions.indexOf(version.version) === -1) {
        uniqVersions.push(version.version)
      }
    })
  })

  let shared, shared_col

  if (shared_with.length === 0) {
    shared = ['Public']
    shared_col = 'green'
  } else {
    shared = shared_with
    shared_col = 'blue'
  }

  useEffect(() => {
    setChecked(active)
  }, [SBOMLinksData])

  const handleArchive = () => {
    const filterData = SBOMLinksData.map((item) =>
      item.id === id
        ? {
            id: item.id,
            link: item.link,
            shared_with: item.shared_with,
            created: item.created,
            visits: item.visits,
            active: false,
            project: item.project,
            version: item.version,
            conf_email: item.conf_email,
            conf_terms: item.conf_terms,
            redactions: item.redactions,
            components: item.components,
            licenses: item.licenses,
            vulnerabilities: item.vulnerabilities,
            cyclonedx: item.cyclonedx,
            spdx: item.spdx
          }
        : item
    )

    console.log('filterData', filterData)
    setSBOMLinksData(filterData)
  }

  const handleCopy = () => {
    sbomLink.onCopy()
    window.localStorage.setItem('path', sbomLink.value)
    window.localStorage.setItem(
      'contains',
      JSON.stringify({
        redactions: redactions,
        vulnerabilities: vulnerabilities,
        cycloneDX: cyclonedx,
        componentsVal: componentsVal ? componentsVal : 126,
        VulnerabilitiesVal: VulnerabilitiesVal
          ? VulnerabilitiesVal
          : '2C, 9H, 5M, 4L',
        activeVulnVal: activeVulnVal ? activeVulnVal : '1C, 1H, 3M, 4L',
        riskScoreVal: riskScoreVal ? riskScoreVal : 22
      })
    )
  }
  return (
    <Tr bg={active ? 'transparent' : 'gray.400'}>
      <Td pl={0}>
        <Switch
          isChecked={checked}
          onChange={(e) => setChecked(!checked)}
          isFocusable
          size='md'
        />
      </Td>
      <Td>
        <Stack direction='row' spacing={2}>
          <Tooltip label='Components'>
            <IconButton
              colorScheme={components ? 'blue' : 'gray'}
              aria-label='Components'
              borderRadius='5px'
              size='sm'
              icon={<FaCubes />}
            />
          </Tooltip>

          <Tooltip label='Licenses'>
            <IconButton
              colorScheme={licenses ? 'blue' : 'gray'}
              aria-label='Licenses'
              borderRadius='5px'
              size='sm'
              icon={<FaBalanceScale />}
            />
          </Tooltip>

          <Tooltip label='Vulnerabilities'>
            <IconButton
              colorScheme={vulnerabilities ? 'blue' : 'gray'}
              aria-label='Vulnerabilities'
              borderRadius='5px'
              size='sm'
              icon={<FaBug />}
            />
          </Tooltip>

          <Tooltip label='Redactions'>
            <IconButton
              colorScheme={redactions ? 'blue' : 'gray'}
              aria-label='Apply redactions'
              borderRadius='5px'
              size='sm'
              icon={<FaEyeSlash />}
            />
          </Tooltip>
        </Stack>
      </Td>
      <Td>{visits}</Td>
      <Td>{timeSince(created)}</Td>
      <Td minWidth={{ sm: '80px' }} pl='0px'>
        {/* </Link> */}
        <Flex mb={2}>
          <Input
            value={sbomLink.value}
            onChange={(e) => sbomLink.setValue(e.target.value)}
            mr={2}
            disabled
          />
          <Button onClick={handleCopy}>
            {sbomLink.hasCopied ? 'Copied!' : 'Copy'}
          </Button>
        </Flex>
        {/* <Link to={`/admin/sboms/${customerId[7]}`}> */}
      </Td>
      <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            icon={<FaEllipsisV />}
            variant='none'
            color='gray.400'
          />
          <Portal>
            <MenuList>
              <MenuItem>{active ? 'Deactivate' : 'Activate'}</MenuItem>
              <MenuItem onClick={onOpen}>Edit</MenuItem>
            </MenuList>
          </Portal>
        </Menu>

        <ProductLinkDrawer
          key={props.id}
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          uniqProjects={uniqProjects}
          uniqVersions={uniqVersions}
          project={props.project}
          version={props.version}
          link={props.link}
          shared_with={props.shared_with}
          components={props.components}
          licenses={props.licenses}
          vulnerability={vulnerabilities}
          conf_email={props.conf_email}
          conf_terms={props.conf_terms}
          redactions={props.redactions}
          cyclonedx={props.cyclonedx}
          spdx={props.spdx}
        />
      </Td>
    </Tr>
  )
}

export default ShareLynkRow
