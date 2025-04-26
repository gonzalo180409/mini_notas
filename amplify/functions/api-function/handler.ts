import type { APIGatewayProxyHandler } from "aws-lambda";

let notas: { id: string; content: string; userId: string }[] = [];

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
  };

  // ✅ Obtener el userId del token Cognito
  const claims = JSON.parse(event.requestContext.authorizer?.jwt?.claims || '{}');
  const userId = claims.sub;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === "GET") {
    // ✅ Devolver solo las notas del usuario autenticado
    const userNotas = notas.filter(n => n.userId === userId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(userNotas),
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
      userId: userId, // ✅ Asociar la nota al usuario autenticado
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
