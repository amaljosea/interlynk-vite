import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text
} from '@chakra-ui/react'

import { GetAllSboms } from 'graphQL/Queries'

const PrimaryWarning = ({
  name,
  isOpen,
  onClose,
  version,
  setData,
  primaryComp
}) => {
  const params = useParams()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { data: allSboms } = useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: signedUrlParams === null ? false : true,
    variables: {
      id: params?.productid
    }
  })

  const allVersions = allSboms?.project?.sboms?.map(
    (item) => item?.projectVersion
  )
  const isExists = allVersions?.includes(version)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Primary Component Change</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            You are about to change primary component
            <br />
            <br />
            From:
            <br />
            <Tag py={1} wordBreak={'break-all'}>
              {primaryComp?.name ? primaryComp?.name : 'None'}
              {primaryComp?.version ? `- ${primaryComp?.version}` : ''}
            </Tag>
            <br />
            <br />
            To:
            <br />
            <Tag py={1} wordBreak={'break-all'}>
              {primaryComp?.name === name ? 'None' : name}
              {primaryComp?.name === name ? '' : `- ${version}`}
            </Tag>
          </Text>
          <br />
          <Tag
            py={1}
            variant='subtle'
            colorScheme='red'
            hidden={!isExists}
            wordBreak={'break-all'}
          >
            This version of the product already exists. Continuing will override
            one of these versions.
          </Tag>
          <Text mt={6}>Are you sure you wish to continue ?</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            No
          </Button>
          <Button
            colorScheme={'red'}
            onClick={() => {
              setData((prev) => !prev)
              onClose()
            }}
          >
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PrimaryWarning
