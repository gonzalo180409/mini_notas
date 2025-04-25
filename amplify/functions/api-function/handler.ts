import type { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  return {
    statusCode: 200,
    // Modify the CORS settings below to match your specific requirements
    headers: {
      "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
      "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
    },
    body: JSON.stringify([
      { id: "1", content: "Primera nota desde Lambda" },
      { id: "2", content: "Otra nota más" },
    ]),
  };
};