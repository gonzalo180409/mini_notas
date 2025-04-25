import type { APIGatewayProxyHandler } from "aws-lambda";

let notas = [
  { id: "1", content: "Primera nota desde Lambda" },
  { id: "2", content: "Otra nota más" },
];

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(notas),
    };
  }

  if (event.httpMethod === "POST") {
    const body = event.body ? JSON.parse(event.body) : null;

    if (!body?.content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Content is required." }),
      };
    }

    const newNota = {
      id: String(Date.now()),
      content: body.content,
    };

    notas.push(newNota);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(newNota),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: "Method Not Allowed" }),
  };
};
