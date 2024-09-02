import { useParams } from 'react-router-dom'

import { ArrowForwardIcon, InfoIcon } from '@chakra-ui/icons'
import { Button, Link, Text } from '@chakra-ui/react'

import LynkModal from './LynkModal'

const InfoModal = ({ isOpen, onClose, heading, body, url }) => {
  const params = useParams()
  const env = params.productid
  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={heading}
      Icon={InfoIcon}
      hidden={true}
    >
      <Text>{body}</Text>
      {env && heading === 'Manufacturer' && (
        <Text mt={3}>{`Setup Manufacturer Identities under -`}</Text>
      )}
      {env && heading === 'Manufacturer' && (
        <Text
          fontWeight={'medium'}
          mt={3}
        >{`Settings > Organization > Legal`}</Text>
      )}
      {url !== '' && (
        <Link href={url} isExternal>
          <Button
            size='sm'
            mt={5}
            rightIcon={<ArrowForwardIcon />}
            colorScheme='blue'
            variant='link'
          >
            Learn more
          </Button>
        </Link>
      )}
    </LynkModal>
  )
}

export default InfoModal
