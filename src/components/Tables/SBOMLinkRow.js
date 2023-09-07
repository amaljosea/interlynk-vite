import {
  Tag,
  Button,
  IconButton,
  Flex,
  Td,
  Tr,
  TagLabel,
  Input,
  Switch,
  useDisclosure,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Portal,
  useClipboard
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { productVersionsData } from 'variables/general'
import { FaEllipsisV } from 'react-icons/fa'
import { timeSince } from 'utils'
import { useMutation } from '@apollo/client'
import { UpdateShareLynk } from 'graphQL/Mutation'
import { DeleteShareLynk } from 'graphQL/Mutation'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'

function SBOMLinkRow(props) {
  const {
    id,
    signedUrlParams,
    updatedAt,
    contents,
    shareUsers,
    enabled,
    refetch
  } = props

  const { isOpen, onOpen, onClose } = useDisclosure()

  const uniqProjects = []

  const btnRef = useRef()

  const [emailList, setEmailList] = useState([])

  const domain = window.location.origin

  const sbomLink = useClipboard(
    `${domain}/login?signed_url_params=${signedUrlParams}`
  )

  const [shareLynkUpdate] = useMutation(UpdateShareLynk)

  const [shareLynkDelete] = useMutation(DeleteShareLynk)

  const handleStatus = async () => {
    try {
      await shareLynkUpdate({
        variables: {
          shareLynkId: id,
          enabled: enabled ? false : true
        }
      }).then(() => refetch())
    } catch (error) {
      console.log(error)
    }
  }

  const handleArchive = async () => {
    try {
      await shareLynkDelete({
        variables: {
          id: id
        }
      }).then(() => refetch())
    } catch (error) {
      console.log(error)
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
      <Td width={'200px'}>
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
              </Tag>
            )
          })}
        </Flex>
      </Td>
      <Td>
        <Flex flexDirection={'row'} flexWrap={'wrap'} spacing={2} gap={2}>
          {contents
            .filter((item) => item.__typename === 'Image')
            .map((image, idx) => {
              return (
                <Tag
                  size='sm'
                  key={idx}
                  borderRadius='full'
                  variant='solid'
                  colorScheme={shared_col}
                >
                  <TagLabel>{image.name}</TagLabel>
                </Tag>
              )
            })}
        </Flex>
      </Td>
      <Td>
        <Flex flexDirection={'row'} flexWrap={'wrap'} spacing={2} gap={2}>
          {contents
            .filter((item) => item.__typename === 'Project')
            .map((project, idx) => {
              return (
                <Tag
                  size='sm'
                  key={idx}
                  borderRadius='full'
                  variant='solid'
                  colorScheme={shared_col}
                >
                  <TagLabel>{project.name}</TagLabel>
                </Tag>
              )
            })}
        </Flex>
      </Td>
      <Td>{timeSince(updatedAt)}</Td>
      <Td width={'400px'} pl='0px'>
        <Flex mb={2}>
          <Input
            value={sbomLink.value}
            onChange={(e) => sbomLink.setValue(e.target.value)}
            mr={2}
            disabled
            fontSize={'sm'}
          />
          <Button onClick={() => sbomLink.onCopy()} fontSize={'sm'}>
            {sbomLink.hasCopied ? 'Copied!' : 'Copy'}
          </Button>
        </Flex>
      </Td>
      <Td pl={0}>
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

        {isOpen && (
          <SBOMDrawer
            id={id}
            isOpen={isOpen}
            onClose={onClose}
            btnRef={btnRef}
            shareUsers={emailList}
            refetch={refetch}
            contents={contents}
          />
        )}
      </Td>
    </Tr>
  )
}

export default SBOMLinkRow
