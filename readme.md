# begin-deno-runtime

this repo holds the deno runtime which we publish as a lambda layer for begin.com

1. Compile the Deno runtime in Cloud9 and copy into a bucket `aws s3 cp deno s3://begin-deno-runtime/deno-1.0.0`
  1.1  curl -fsSL https://github.com/denoland/deno/releases/download/v1.0.0/deno_src.tar.gz --output deno.tar.gz 
  1.2 tar -zxf deno.tar.gz
  1.3 cd cli
  1.4 cargo install --locked --root .. --path .
  1.5 cp -r ../bin/deno /home/ec2-user/environment/deno
2. Overwrite `src/bin/deno` with the new binary; ensure `chmod +x src/bin/deno`
3. Modify `package.json` with the correct version numbers and run `npm run start` to compile the layer
4. `npm run publish` to publish the layer to the `begin-deno-runtime` bucket
5. create new layers in root lambda console and call fix.sh to ensure they can be read by everyone
