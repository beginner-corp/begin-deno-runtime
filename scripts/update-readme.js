let aws = require('aws-sdk')
let semver = require('semver')
let tiny = require('tiny-json-http')

let regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'ap-south-1',
  'ap-northeast-3',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-north-1',
  'eu-west-3',
  'sa-east-1',
]

;(async function() {
  let md = '# DenoRuntime Lambda Layer\n\n'
  md += `> this readme was generated by .github/workflows/readme.yaml\n\n`
  for (let region of regions) {
    let values = await getAllVersions(region)
    if (values.length) {
      md += `## ${ region }\n`
      for (let layer of values) {
        md += `- <strong>${layer.version}</strong> `
        md += `<pre>${layer.arn}</pre>\n`
      }
      md += `\n`
    }
  }
  await write(md)
})();

/** get all the DenoRuntime layer versions for given region */
async function getAllVersions(region) {
  let results = []
  let lambda = new aws.Lambda({ region })
  let params = {LayerName: 'DenoRuntime'}
  async function getPage(params) {
    // get the raw versions result
    let result = await lambda.listLayerVersions(params).promise()
    // helper to format to {arn, version}
    let fmt = v=> ({arn: v.LayerVersionArn, version: v.Description})
    // helper to filter to good versions
    let ok = v=> semver.valid(v.version)
    // map/filter results
    results = results.concat(result.LayerVersions.map(fmt).filter(ok))
    if (result.NextMarker) {
      params.Marker = result.NextMarker
      await getPage(params)
    }
  }
  await getPage(params)
  return results
}

/** helper to write the readme using the github api */
async function write(md) {

  let headers = {
    authorization: `token ${ process.env.GITHUB_TOKEN }`,
    accept: 'application/vnd.github.v3+json'
  }

  // get the sha of the readme
  let { sha } = await tiny.get({
    url: `https://api.github.com/repos/beginner-corp/begin-deno-runtime/readme`,
    headers,
  }) 

  // write the readme
  return tiny.put({
    url: `https://api.github.com/repos/beginner-corp/begin-deno-runtime/contents/readme.md`,
    headers,
    data: {
      sha,
      message: `update readme`,
      content: Buffer.from(md).toString('base64')
    }
  })
}
