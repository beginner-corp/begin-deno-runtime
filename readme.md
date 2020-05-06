# begin-deno-runtime

this repo holds the deno runtime which we publish as a lambda layer for begin.com

1. Compile the Deno runtime in Cloud9 and copy into a bucket `aws s3 cp deno s3://begin-deno-runtime/deno-1.0.0`
2. Overwrite `src/bin/deno` with the new binary; ensure `chmod +x src/bin/deno`
3. Modify `package.json` with the correct version numbers and run `npm run start` to compile the layer
4. `npm run publish` to publish the layer to the `begin-deno-runtime` bucket
