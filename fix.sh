aws lambda add-layer-version-permission --layer-name DenoRuntime \
--statement-id allow-everyone --version-number 9 --principal '*' \
--action lambda:GetLayerVersion
