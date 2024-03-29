// coldstart here
let env = Deno.env.toObject();
let api = env.AWS_LAMBDA_RUNTIME_API;
let name = env._HANDLER.split(".")[0];
let method = env._HANDLER.split(".")[1];
let invoke = `http://${api}/2018-06-01/runtime/invocation`;
let error = `http://${api}/2018-06-01/runtime/init/error`;

// look for index.{js,ts,tsx} and fallback to mod.{js,ts,tsx}
let paths = [
  `${env.LAMBDA_TASK_ROOT}/index.js`,
  `${env.LAMBDA_TASK_ROOT}/mod.js`,
  `${env.LAMBDA_TASK_ROOT}/index.ts`,
  `${env.LAMBDA_TASK_ROOT}/mod.ts`,
  `${env.LAMBDA_TASK_ROOT}/index.tsx`,
  `${env.LAMBDA_TASK_ROOT}/mod.tsx`,
];

// get the handler entry file
let found = false;
let handler;

for (let path of paths) {
  found = await exists(path);
  if (found) {
    let mod = await import(path);
    handler = mod[method];
    if (typeof handler != "function") {
      found = false;
    } else {
      break;
    }
  }
}

// if entry file is missing or invalid bail hard with a meaningful error
if (found === false) {
  await post(error, {
    errorType: "HandlerNotFound",
    errorMessage:
      `expected one of mod.js, mod.ts, mod.tsx, index.js, index.ts, or index.tsx to export a function named "${method}"`,
  });
  Deno.exit(1);
}

// all good! start the event loop
while (true) {
  let { event, context } = await next(`${invoke}/next`);
  try {
    // invoke the handler
    const payload = await handler(event, context);
    await post(`${invoke}/${context.awsRequestId}/response`, payload);
  } catch (err) {
    // ensure errors bubble
    await post(`${invoke}/${context.awsRequestId}/error`, {
      errorType: err.name,
      errorMessage: err.message,
      stackTrace: err.stack,
    });
  }
}

/** helper to get next invocation */
async function next(url: string) {
  let env = Deno.env.toObject();
  let req = await fetch(url);
  let reqID = req.headers.get("Lambda-Runtime-Aws-Request-Id");
  let arn = req.headers.get("lambda-runtime-invoked-function-arn");
  let event = await req.json();
  let context = {
    awsRequestId: reqID,
    invokedFunctionArn: arn,
    logGroupName: env.AWS_LAMBDA_LOG_GROUP_NAME,
    logStreamName: env.AWS_LAMBDA_LOG_STREAM_NAME,
    functionName: env.AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: env.AWS_LAMBDA_FUNCTION_VERSION,
    memoryLimitInMB: env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
  };
  return { event, context };
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
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
}
