import { useState } from 'react'

import { Flex, Text, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CustomLoader from 'components/CustomLoader'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import ActivitiesOverviewRow from 'components/Tables/ActivitiesOverviewRow'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEye } from 'react-icons/fa'

const ActivitiesOverview = ({ loading, title, data }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const [activeRow, setActiveRow] = useState('')

  const PURL = useDisclosure()
  const CPE = useDisclosure()

  return (
    <>
      <Card maxH='100%'>
        <Flex direction='column'>
          <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
            {title}
          </Text>
        </Flex>
        {loading ? (
          <CustomLoader />
        ) : (
          <CardBody mt={8} ps='20px' pe='0px' position='relative'>
            <Flex direction='column'>
              {data?.length > 0 &&
                data?.map((row, index) => {
                  return (
                    <ActivitiesOverviewRow
                      key={index}
                      logo={FaEye}
                      event={row.event}
                      orig={row.orig}
                      updated={row.updated}
                      changedBy={row.changedBy}
                      date={row.updatedAt}
                      color={'gray'}
                      index={index}
                      arrLength={data?.length}
                      action={row.action}
                      onOpen={PURL.onOpen}
                      onCpeOpen={CPE.onOpen}
                      setActiveRow={setActiveRow}
                    />
                  )
                })}
            </Flex>
          </CardBody>
        )}
      </Card>

      {PURL.isOpen && (
        <PurlCard
          value={activeRow}
          isOpen={PURL.isOpen}
          onClose={PURL.onClose}
        />
      )}

      {CPE.isOpen && (
        <CpeCard value={activeRow} isOpen={CPE.isOpen} onClose={CPE.onClose} />
      )}
    </>
  )
}

export default ActivitiesOverview
