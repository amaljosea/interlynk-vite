import { useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { Stack, Tag, Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { GetAllSboms } from 'graphQL/Queries'

import { LuMessageCircleQuestion } from 'react-icons/lu'

const PrimaryWarning = ({ isOpen, onClose, primaryComp }) => {
  const params = useParams()
  const signedUrlParams = getSignedUrlParams()

  const { tabData, setTabData } = useContext(TabContext)
  const { details } = tabData

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

  const isSame = primaryComp?.name === details?.name
  const isExists = !isSame && allVersions?.includes(details?.version)

  const handleSave = () => {
    setTabData((prev) => ({
      ...prev,
      details: {
        ...prev?.details,
        primary: !prev.details.primary
      }
    }))
    onClose()
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'Primary Component Change'}
      onSubmit={handleSave}
      buttonText='Yes'
      buttonColor='red'
      Icon={LuMessageCircleQuestion}
    >
      <Stack spacing={6}>
        <Text>You are about to change primary component</Text>
        <Stack spacing={0}>
          <Text>From:</Text>
          <Tag py={1} w={'fit-content'} wordBreak={'break-all'}>
            {primaryComp?.name ? primaryComp?.name : 'None'}
            {primaryComp?.version ? `- ${primaryComp?.version}` : ''}
          </Tag>
        </Stack>
        <Stack spacing={0}>
          <Text>To:</Text>
          <Tag py={1} w={'fit-content'} wordBreak={'break-all'}>
            {isSame ? 'None' : details?.name}
            {isSame ? '' : `- ${details?.version}`}
          </Tag>
        </Stack>
        <Tag
          py={1}
          variant='subtle'
          colorScheme='red'
          hidden={!isExists}
          wordBreak={'break-word'}
        >
          This version of the product already exists. Continuing will override
          one of these versions.
        </Tag>
        <Text mt={6}>Are you sure you wish to continue ?</Text>
      </Stack>
    </LynkModal>
  )
}

export default PrimaryWarning
