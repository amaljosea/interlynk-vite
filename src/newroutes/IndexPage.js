import React from 'react'
import { Link } from 'react-router-dom'

const PROJECT_GROUP_ID = '52f84eb3-2ce8-485d-96eb-02220b27c08a'
const PROJECT_ID = 'b93821d3-3edb-47f1-9894-04d7bd4ddda3'
const VUL_ID = 'bc5c7a05-b617-4da7-899b-5c6e30ca6490'
const SBOM = 'f4a4fccf-d18c-4a14-bc67-68b6746ee6ff'

export const IndexPage = () => {
  return (
    <div>
      <h1>Index Page</h1>
      <ul>
        <li>
          <Link
            to={`/vendor/products2/${PROJECT_GROUP_ID}/env/${PROJECT_ID}?tab=changelog`}
          >
            Go to Product Detail Page
          </Link>
        </li>
        <li>
          <Link
            to={`/vendor/products2/${PROJECT_GROUP_ID}/env/${PROJECT_ID}/version/${SBOM}?tab=changelog`}
          >
            Go to Product Version Detail Page
          </Link>
        </li>
        <li>
          <Link
            to={`/vendor/products2/${PROJECT_GROUP_ID}/env/${PROJECT_ID}/vulnerability/${VUL_ID}`}
          >
            Go to Product Vulnerability Detail Page
          </Link>
        </li>
      </ul>
    </div>
  )
}
