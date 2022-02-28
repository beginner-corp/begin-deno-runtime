aws lambda add-layer-version-permission --layer-name DenoRuntime \
--statement-id allow-everyone1 --version-number 11 --principal '*' \
--action lambda:GetLayerVersion

