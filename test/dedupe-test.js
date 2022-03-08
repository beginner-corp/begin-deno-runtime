let test = require('tape')
let { dedupe } = require('../scripts/update-readme')

test('dedupes', t=> {
  t.plan(1)
  let raw = [
    {version: '1.19.1-x86', arn: 'arn:aws:lambda:us-east-1:555:layer:DenoRuntime:29'},
    {version: '1.19.1-x86', arn: 'arn:aws:lambda:us-east-1:555:layer:DenoRuntime:27'},
    {version: '1.19.1-x86', arn: 'arn:aws:lambda:us-east-1:555:layer:DenoRuntime:26'},
    {version: '1.0.0-x86', arn: 'arn:aws:lambda:us-east-1:555:layer:DenoRuntime:0'},
  ]
  let desired = [
    {version: '1.19.1-x86', arn: 'arn:aws:lambda:us-east-1:555:layer:DenoRuntime:29'}, 
    {version: '1.0.0-x86', arn: 'arn:aws:lambda:us-east-1:555:layer:DenoRuntime:0'}
  ]
  let result = dedupe(raw)
  t.deepEqual(result, desired)
})
