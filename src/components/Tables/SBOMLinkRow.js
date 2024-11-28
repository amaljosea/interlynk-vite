import { useMutation } from '@apollo/client'
import { useRef, useState } from 'react'
import { getFullDateAndTime, timeSince } from 'utils'

import {
  Button,
  Flex,
  Input,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Tag,
  TagLabel,
  Td,
  Tooltip,
  Tr,
  useClipboard,
  useDisclosure
} from '@chakra-ui/react'

import SBOMDrawer from 'components/Drawer/SBOMDrawer'
import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateShareLynk } from 'graphQL/Mutation'
import { DeleteShareLynk } from 'graphQL/Mutation'

function SBOMLinkRow(props) {
  const { id, signedUrlParams, updatedAt, contents, shareUsers, enabled } =
    props

  const { isOpen, onOpen, onClose } = useDisclosure()

  const btnRef = useRef()

  const [emailList, setEmailList] = useState([])

  const domain = window.location.origin

  const sbomLink = useClipboard(
    `${domain}/login?signed_url_params=${signedUrlParams}`
  )

  const showToast = useCustomToast()

  const [shareLynkUpdate] = useMutation(UpdateShareLynk)

  const [shareLynkDelete] = useMutation(DeleteShareLynk)

  const handleStatus = async () => {
    try {
      await shareLynkUpdate({
        variables: {
          shareLynkId: id,
          enabled: enabled ? false : true
        }
      })
    } catch (error) {
      showToast({
        description: `Unable to update status now, please try again.`,
        status: 'error'
      })
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
      showToast({
        description: `Unable to Archive now, please try again.`,
        status: 'error'
      })
    }
  }

  let shared_col

  if (shareUsers.length === 0) {
    shared_col = 'green'
  } else {
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
      <Td>
        <LynkSwitch isChecked={enabled} readOnly size='md' />
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
      <Td width={'200px'}>
        <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
          {timeSince(updatedAt)}
        </Tooltip>
      </Td>
      <Td width={'400px'} pl='0px'>
        <Flex mb={2}>
          <Input
            value={sbomLink.value}
            onChange={(e) => sbomLink.setValue(e.target.value)}
            mr={2}
            disabled
            fontSize={'sm'}
          />
          <Button
            title='Copy sbom link'
            onClick={() => sbomLink.onCopy()}
            fontSize={'sm'}
          >
            {sbomLink.hasCopied ? 'Copied!' : 'Copy'}
          </Button>
        </Flex>
      </Td>
      <Td pl={0}>
        <Menu>
          <LynkAction aria-label='Options' />
          <Portal>
            <MenuList fontSize={'sm'}>
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
            contents={contents}
          />
        )}
      </Td>
    </Tr>
  )
}

export default SBOMLinkRow
