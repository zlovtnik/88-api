export const logRequest = (request: Request) => {
  const { method, url } = request;
  console.log(`[${new Date().toISOString()}] [REQUEST] ${method} ${url}`);
};

export const logResponse = (request: Request, response: Response) => {
  const { method, url } = request;
  console.log(
    `[${new Date().toISOString()}] [RESPONSE] ${method} ${url} -> ${response.status}`
  );
}; 