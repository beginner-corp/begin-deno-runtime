let aws = require('aws-sdk')
let regions = require('./supported-regions')

;(async function () {
  for (let region in regions) {
    await publish(region)
  }
})();

async function publish (region) {
  let lambda = new aws.Lambda({ region })
  let verg
}
publish-layer-version 
--description ${{ env.version }}-x86 
--layer-name DenoRuntime 
--zip-file fileb://deno-${{ env.version }}-x86.zip 
--license-info "Apache-2.0" 
--query 'Version' 
--region us-west-2

add-layer-version-permission 
--layer-name DenoRuntime 
--statement-id allow-every1 
--version-number $v 
--principal '*' 
--action lambda:GetLayerVersion 
--region us-west-2
