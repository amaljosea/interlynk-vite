import { Flex, Text } from '@chakra-ui/react'

export const homeSteps = [
  {
    selector: '.welcome',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Welcome to the Interlynk
        </Text>
        <Text>
          Interlynk’s SBOM Management Platform is the ultimate solution for
          managing a product’s software composition using SBOM and vulnerability
          exploitability using VEX.
        </Text>
        <Text>
          Let’s guide you through the essential features to help you utilize the
          Dashboard effectively.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.products',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Products
        </Text>
        <Text>
          The Products page lists all Products and sub-products with their
          versions.
        </Text>
        <Text>
          The versions are represented by SBOM with ability to review all of the
          SBOM details such as components, hierarchy, licenses, as well as
          Interlynk enriched data such as vulnerabilities, exploitability,
          maintainability and compliance.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.requests',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Requests
        </Text>
        <Text>
          The Requests page supports creating SBOM request from external
          vendors.
        </Text>
        <Text>
          The collected SBOM can be used for monitoring by itself or be included
          in other products.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.vulnerabilities',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Vulnerabiliities
        </Text>
        <Text>
          The Vulnerabilities page provides a global view for all vulnerability
          associated with any product or version.
        </Text>
        <Text>
          This view also supports ability to set exploitability status of the
          vulnerability across mulitple products and versions.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.licenses',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Licenses
        </Text>
        <Text>
          The Licenses page provides a global view for all licenses and its
          attributes associated with any product or version.
        </Text>
        <Text>
          This view also supports ability to add custom licenses and to set
          restriction on licenses used within the organization.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.analytics',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Analytics
        </Text>
        <Text>
          The Analytics page provides access to commonly tracked metrics include
          compliance metrics such as ‘defect density’ and ‘patch velocity’
        </Text>
      </Flex>
    )
  },
  {
    selector: '.tools',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Tools
        </Text>
        <Text>The Tools page lists SBOM specific tools.</Text>
        <Text>
          It currently supports a utility to compare product versions across
          different products or environments.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.support',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Support
        </Text>
        <Text>
          Interlynk monitors open source ecosystems to track support level and
          maintainability of commonly used components.
        </Text>
        <Text>
          The Support page allows ability to set support levels and
          maintainability details for other component.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.policies',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Policies
        </Text>
        <Text>
          The Policy page supports creation of organization wide policies
          associated with specific component, licenses, vulnerability or state
          of the vulnerability.
        </Text>
        <Text>
          The applicability of these policies can be controlled at product
          level. The policy results are avialable with each version of the
          product.
        </Text>
      </Flex>
    )
  }
]

export const productSteps = [
  {
    selector: '.product',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Welcome to the Products
        </Text>
        <Text>
          Let’s guide you through the essential features that will help you
          setup Products effectively.
        </Text>
        <Text>Click on any product to continue.</Text>
      </Flex>
    )
  },
  {
    selector: '.environments',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Environments
        </Text>
        <Text>
          Products are organized around environments they support. Interlynk by
          default ships with three environments - “default”, “development” and
          “production”.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.product-details',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Product Details
        </Text>
        <Text>
          Interlynk represents a software, hardware or even third-party
          component as a Product.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.versions',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Versions
        </Text>
        <Text>
          This table lists all versions of the product included in product.
        </Text>
        <Text>
          The columns Components, Licenses, and Vulnerabilities summarize the
          version’s details, and status represents the state of the most recent
          SBOM for that version.
        </Text>
        <Text>Click on a version to continue.</Text>
      </Flex>
    )
  },
  {
    selector: '.vulnerabilities',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Vulnerabilities
        </Text>
        <Text>
          The Vulnerabilities page provides a quick view for all vulnerability
          associated with this product regardless of the version.
        </Text>
        <Text>
          This view also supports ability to set exploitability status of the
          vulnerability across mulitple versions.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.automation-rules',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Automation Rules
        </Text>
        <Text>
          Interlynk supports creating rules to fix most common data issues
          associated with SBOM
        </Text>
        <Text>
          Automation rules for the can be created here directly or from inside a
          version’s failed Checks.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.policies',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Policies
        </Text>
        <Text>
          This tab can be used to control applicability of a global policy for
          this product.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.version',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Version
        </Text>
        <Text>
          This view details a single version as represented by its most recent
          SBOM. The top card summarizes associated counts, while the bottom
          section provides details and search and filter controls to narrow the
          details
        </Text>
      </Flex>
    )
  },
  {
    selector: '.general',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          General Tab
        </Text>
        <Text>
          The General tab lists metadata associated with the SBOM, including
          details of its creation, supplier, and license associated with using
          SBOM data.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.parts',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Parts Tab
        </Text>
        <Text>
          The Parts tab lists any other product’s version that is used as a part
          in this Product.
        </Text>
        <Text>
          If a product version is included as a part, its components, licenses
          and vulnerabilities will also get included in the current product.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.components',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Components Tab
        </Text>
        <Text>
          The Components tab lists all included components and can be searched
          for direct dependencies as well as components with specific names,
          licenses, or identifiers (CPE or PURL).
        </Text>
      </Flex>
    )
  },
  {
    selector: '.vulnerabilities',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Vulnerabilities Tab
        </Text>
        <Text>
          The Vulnerabilities tab lists all vulnerabilities detected against the
          version using SBOM.
        </Text>
        <Text>
          For each vulnerability, the tab also includes the status of the
          vulnerability as declared by the owner.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.licenses',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Licenses Tab
        </Text>
        <Text>
          The Licenses tab lists all applicable licenses and the components that
          include those licenses
        </Text>
      </Flex>
    )
  },
  {
    selector: '.checks',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Checks Tab
        </Text>
        <Text>
          Interlynk runs a set of checks to understand common issues associated
          with the SBOM. This tab lists result of the checks and ability to fix
          them manually or by creating automation rules for it.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.search-version',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Other Versions
        </Text>
        <Text>
          To quickly switch to another version of the same product, use the
          “Search Versions” control.
        </Text>
      </Flex>
    )
  },
  {
    selector: '.download',
    content: (
      <Flex flexDir={'column'} gap={2}>
        <Text fontSize={16} fontWeight={'semibold'}>
          Download
        </Text>
        <Text>
          The download button allows access to the underlying SBOM in CyclnoneDX
          and SPDX specifications.
        </Text>
        <Text>
          Download can optionally include vulnerability status using VEX.
        </Text>
      </Flex>
    )
  }
]
