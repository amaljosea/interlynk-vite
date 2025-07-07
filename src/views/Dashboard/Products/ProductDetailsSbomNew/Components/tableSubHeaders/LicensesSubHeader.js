import { useMemo } from 'react'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { useRouteFlags } from 'hooks/useRouteFlags'

const LicensesSubHeader = () => {
  const { isCustomerView } = useRouteFlags()
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent='flex-end'
        gap={2}
      >
        {/* EXPORT CSV */}
        {!isCustomerView && <ExportCsv tableType='SBOM License View' />}

        <RefreshBtn
          queries={[
            isCustomerView ? 'GetShareLicensesTable' : 'GetSbomLicensesTable'
          ]}
        />
      </Flex>
    )
  }, [isCustomerView])

  return subHeader
}

export default LicensesSubHeader
