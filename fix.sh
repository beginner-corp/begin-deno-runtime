aws lambda add-layer-version-permission --layer-name DenoRuntime \
--statement-id allow-everyone1 --version-number 14 --principal '*' \
--action lambda:GetLayerVersion
