import type { APIGatewayProxyHandler } from "aws-lambda";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource"; // ajustá si tu ruta es diferente

const client = generateClient<Schema>();

export const handler: APIGatewayProxyHandler = async (event) => {
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
    try {
      const result = await client.models.Nota.list();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.data),
      };
    } catch (err) {
      console.error("Error en GET:", err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Error al obtener notas" }),
      };
    }
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

    try {
      const result = await client.models.Nota.create({
        content: body.content,
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result.data),
      };
    } catch (err) {
      console.error("Error en POST:", err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Error al crear nota" }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: "Method Not Allowed" }),
  };
};
