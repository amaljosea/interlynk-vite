import { useMemo } from 'react'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

const LicensesSubHeader = () => {
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent='flex-end'
        gap={3}
      >
        {/* EXPORT CSV */}
        <ExportCsv tableType='SBOM License View' />
        <RefreshBtn />
      </Flex>
    )
  }, [])

  return subHeader
}

export default LicensesSubHeader
