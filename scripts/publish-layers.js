let aws = require('aws-sdk')
let fs = require('fs')
let path = require('path')
let regions = require('./supported-regions')

;(async function () {
  for (let region of regions) {
    let result = await publish(region)
    console.log(result)
  }
})();

async function publish (region) {
  console.log('publish to layer to', region)
  try {
    let lambda = new aws.Lambda({ region })
 
    // read the zip
    let pathToFile = path.join(__dirname, '..', `deno-${process.env.version}-x86.zip`)
    let file = fs.readFileSync(pathToFile).toString('base64')
 
    // publish the zip
    let { Version } = await lambda.publishLayerVersion({
      LayerName: `DenoRuntime`,
      Description: `${ process.env.version }-x86`,
      CompatibleArchitectures: ['x86_64'],
      Content: { ZipFile: file },
      LicenseInfo: 'Apache-2.0' 
    }).promise()
 
    // reset the permissions
    return lambda.addLayerVersionPermission({
      Action: 'lambda:GetLayerVersion',
      LayerName: `DenoRuntime`,
      Principal: '*',
      StatementId: `allow-${ Date.now() }`,
      VersionNumber: Version,
    }).promise()
  }
  catch (e) {
    return e
  }
}
