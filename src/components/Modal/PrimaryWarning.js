import { useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { QuestionIcon } from '@chakra-ui/icons'
import { Tag, Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { GetAllSboms } from 'graphQL/Queries'

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
  const isExists = allVersions?.includes(details?.version)

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
      Icon={QuestionIcon}
    >
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
          {primaryComp?.name === name ? 'None' : details?.name}
          {primaryComp?.name === name ? '' : `- ${details?.version}`}
        </Tag>
      </Text>
      <br />
      <Tag
        py={1}
        variant='subtle'
        colorScheme='red'
        hidden={!isExists}
        wordBreak={'break-word'}
      >
        This version of the product already exists. Continuing will override one
        of these versions.
      </Tag>
      <Text mt={6}>Are you sure you wish to continue ?</Text>
    </LynkModal>
  )
}

export default PrimaryWarning
