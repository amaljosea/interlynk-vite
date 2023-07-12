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
import React, { useState } from 'react'

import { productVersionsData } from 'variables/general'
import SBOMLinkDrawer from 'components/Drawer/SBOMLinkDrawer.js'
import {
  FaBalanceScale,
  FaCubes,
  FaEllipsisV,
  FaBug,
  FaEyeSlash
} from 'react-icons/fa'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import { timeSince } from 'utils'
import { useMutation } from '@apollo/client'
import { UpdateShareLynk } from 'graphQL/Mutation'
import { DeleteShareLynk } from 'graphQL/Mutation'

function SBOMLinkRow(props) {
  const {
    componentsVal,
    VulnerabilitiesVal,
    activeVulnVal,
    riskScoreVal
  } = useContext(GlobalContext)
  const {
    id,
    signedUrlParams,
    updatedAt,
    shareUsers,
    shareScanners,
    enabled,
    imageDataRefetch,
    imgVersionId,
    scanResults
  } = props

  const { isOpen, onOpen, onClose } = useDisclosure()

  const uniqProjects = []
  const btnRef = React.useRef()

  const [emailList, setEmailList] = useState([])

  // const customerId = link.split('/')

  const sbomLink = useClipboard(
    `http://localhost:3001/customer/signed_url_params?${signedUrlParams}`
  )

  // `https://dashboard-app.fly.dev/#/customer/sboms/${customerId[7]}`

  // `http://localhost/#/customer/sboms/${customerId[7]}`

  const [shareLynkUpdate] = useMutation(UpdateShareLynk, {
    onCompleted: imageDataRefetch
  })

  const [shareLynkDelete] = useMutation(DeleteShareLynk, {
    onCompleted: imageDataRefetch
  })

  const handleStatus = async () => {
    try {
      await shareLynkUpdate({
        variables: {
          shareLynkId: id,
          enabled: enabled ? false : true
        }
      })
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert(
          'Duplicate connector is being created for Dockerhub with the same account ID.'
        )
      } else {
        // Handle other errors
        alert(error.message)
      }
    }
  }

  const handleArchive = async () => {
    try {
      await shareLynkDelete({
        variables: {
          id: id
        }
      })
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert(
          'Duplicate connector is being created for Dockerhub with the same account ID.'
        )
      } else {
        // Handle other errors
        alert(error.message)
      }
    }
  }

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

  if (shareUsers.length === 0) {
    shared = ['Public']
    shared_col = 'green'
  } else {
    shared = shareUsers
    shared_col = 'blue'
  }

  const handleCopy = () => {
    sbomLink.onCopy()
    window.localStorage.setItem('path', sbomLink.value)
    window.localStorage.setItem(
      'contains',
      JSON.stringify({
        redactions: false,
        vulnerabilities: false,
        cycloneDX: false,
        componentsVal: componentsVal ? componentsVal : 126,
        VulnerabilitiesVal: VulnerabilitiesVal
          ? VulnerabilitiesVal
          : '2C, 9H, 5M, 4L',
        activeVulnVal: activeVulnVal ? activeVulnVal : '1C, 1H, 3M, 4L',
        riskScoreVal: riskScoreVal ? riskScoreVal : 22
      })
    )
  }

  const handleEdit = () => {
    onOpen()
    if (shareUsers.length > 0) {
      setEmailList(shareUsers.map((item) => item.email))
    }
  }

  return (
    <Tr>
      <Td pl={0}>
        <Switch isChecked={enabled} readOnly size='md' />
      </Td>
      <Td maxW='400px'>
        <Flex flexDirection={'row'} flexWrap={'wrap'} spacing={2} gap={2}>
          {shareUsers.map((user, idx) => {
            return (
              <Tag
                size='sm'
                key={idx}
                borderRadius='full'
                variant='solid'
                colorScheme={shared_col}
              >
                <TagLabel>{user.email}</TagLabel>
                {/* <TagCloseButton /> */}
              </Tag>
            )
          })}
        </Flex>
      </Td>
      {/* <Td>{visits}</Td> */}
      <Td>
        <Text fontSize={'sm'}>{timeSince(updatedAt)}</Text>
      </Td>
      <Td minWidth={{ sm: '80px' }} pl='0px'>
        {/* </Link> */}
        <Flex mb={2}>
          <Input
            value={`http://localhost:3001/customer/signed_url_params?${signedUrlParams}`}
            onChange={(e) => sbomLink.setValue(e.target.value)}
            mr={2}
            disabled
            fontSize={'sm'}
          />
          <Button onClick={handleCopy} fontSize={'sm'}>
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
              <MenuItem onClick={handleStatus}>
                {enabled ? 'Deactivate' : 'Activate'}
              </MenuItem>
              <MenuItem onClick={handleEdit}>Edit</MenuItem>
              <MenuItem onClick={handleArchive}>Archive</MenuItem>
            </MenuList>
          </Portal>
        </Menu>
        <SBOMLinkDrawer
          id={id}
          emailList={emailList}
          setEmailList={setEmailList}
          shareScanner={shareScanners}
          imageDataRefetch={imageDataRefetch}
          imgVersionId={imgVersionId}
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          scanResults={scanResults}
        />
      </Td>
    </Tr>
  )
}

export default SBOMLinkRow
