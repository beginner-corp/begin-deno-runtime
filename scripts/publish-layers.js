let aws = require('aws-sdk')
let fs = require('fs')
let path = require('path')
let regions = require('./supported-regions')
let pathToFile = path.join(__dirname, '..', `deno-${process.env.version}-x86.zip`)
let layer = fs.readFileSync(pathToFile)

;(async function () {
  for (let region of regions) {
    let result = await publish(region)
    console.log(result)
  }
})();

/** helper to publish layer code and blow open the permissions so anyone can use it */
async function publish (region) {
  console.log('publish to layer to', region)
  try {
    let lambda = new aws.Lambda({ region })
 
    // publish the zip
    let { Version } = await lambda.publishLayerVersion({
      LayerName: `DenoRuntime`,
      Description: `${ process.env.version }-x86`,
      Content: { ZipFile: layer },
      LicenseInfo: 'Apache-2.0' 
      // CompatibleArchitectures: ['x86_64'], this is not yet supported in all regions!
    }).promise()

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
