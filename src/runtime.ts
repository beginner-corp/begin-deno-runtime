// coldstart here
let env = Deno.env.toObject();
let api = env.AWS_LAMBDA_RUNTIME_API;
let name = env._HANDLER.split(".")[0];
let method = env._HANDLER.split(".")[1];

// get the handler entry file
let handler;
let path = `${env.LAMBDA_TASK_ROOT}/${name}.ts`;
let found = await exists(path);
if (found) {
  let mod = await import(path);
  handler = mod[method];
  if (!handler) found = false;
}

// if entry file is missing or invalid bail hard with a meaningful error
if (!found) {
  await post(`http://${api}/2018-06-01/runtime/init/error`, {
    errorType: "HandlerNotFound",
    errorMessage: `expected "${path}" to export a function named "${method}"`,
  });
  Deno.exit(1);
}

// start the event loop
while (true) {
  // massage invocation payload
  let invoke = `http://${api}/2018-06-01/runtime/invocation`;
  let next = await fetch(`${invoke}/next`);
  let event = await next.json();
  let reqID = next.headers.get("Lambda-Runtime-Aws-Request-Id");
  let context = {
    awsRequestId: next.headers.get("lambda-runtime-aws-request-id"),
    invokedFunctionArn: next.headers.get("lambda-runtime-invoked-function-arn"),
    logGroupName: env.AWS_LAMBDA_LOG_GROUP_NAME,
    logStreamName: env.AWS_LAMBDA_LOG_STREAM_NAME,
    functionName: env.AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: env.AWS_LAMBDA_FUNCTION_VERSION,
    memoryLimitInMB: env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
  };

  // invoke the handler
  try {
    let res = await handler(event, context);
    await post(`${invoke}/${reqID}/response`, res);
  } catch (err) {
    await post(`${invoke}/${reqID}/error`, {
      errorType: err.name,
      errorMessage: err.message,
      stackTrace: err.stack,
    });
  }

  // end while
}

/** helper to post message to lambda */
async function post(url: string, payload: object) {
  let result = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await result.blob();
}

/** helper to check for the entry file */
async function exists(filename: string): Promise<boolean> {
  try {
    await Deno.stat(filename);
    // successful, file or directory must exist
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // file or directory does not exist
      return false;
    } else {
      // unexpected error, maybe permissions, pass it along
      throw error;
    }
  }
}
