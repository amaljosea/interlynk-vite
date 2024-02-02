import { Grid, GridItem } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import SbomActions from './SbomActions'
import SbomDetails from './SbomDetails'

const SbomInfo = ({ sbom, refetch, getCompData, getVulnData, prodRefetch }) => {
  return (
    <Card mb='6'>
      <CardBody>
        {sbom && (
          <Grid
            width={'100%'}
            templateColumns='repeat(5, 1fr)'
            alignItems={'top'}
            gap={40}
          >
            {/* SBOM INFORMATIONS */}
            <GridItem colSpan={3}>
              <SbomDetails
                sbom={sbom}
                getCompData={getCompData}
                getVulnData={getVulnData}
              />
            </GridItem>

            {/* SBOM ACTIONS */}
            <GridItem colSpan={2}>
              <SbomActions
                sbom={sbom}
                refetch={refetch}
                getCompData={getCompData}
                prodRefetch={prodRefetch}
              />
            </GridItem>
          </Grid>
        )}
      </CardBody>
    </Card>
  )
}

export default SbomInfo
