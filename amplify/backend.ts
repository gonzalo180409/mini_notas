import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";

// 1. Importamos servicios de API Gateway y IAM
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

// 2. Recursos del backend que ya tenés
import { auth } from "./auth/resource";
import { data } from "./data/resource"; // Puedes eliminar esto si no usás `client.models`
import { myApiFunction } from "./functions/api-function/resource";

// 3. Definimos el backend base
const backend = defineBackend({
  auth,
  data,
  myApiFunction,
});

// 4. Creamos una pila (stack) para la API
const apiStack = backend.createStack("api-stack");

// 5. Creamos la REST API
const myRestApi = new RestApi(apiStack, "RestApi", {
  restApiName: "myRestApi",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

// 6. Creamos una integración Lambda
const lambdaIntegration = new LambdaIntegration(
  backend.myApiFunction.resources.lambda
);

// 7. Ruta: /items (con IAM authorization)
const itemsPath = myRestApi.root.addResource("items", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});

// Métodos para /items
itemsPath.addMethod("GET", lambdaIntegration);
itemsPath.addMethod("POST", lambdaIntegration);
itemsPath.addMethod("DELETE", lambdaIntegration);
itemsPath.addMethod("PUT", lambdaIntegration);

// Opción de proxy para más rutas bajo /items/*
itemsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});

// 8. Ruta: /cognito-auth-path (con Cognito auth)
const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});

const booksPath = myRestApi.root.addResource("cognito-auth-path");
booksPath.addMethod("GET", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

// 9. Permitir acceso a los roles IAM (para usar /items con auth o guest)
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/items", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/items/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/cognito-auth-path", "dev")}`,
      ],
    }),
  ],
});

backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiRestPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(apiRestPolicy);

// 10. Agregar salida con la URL de la API
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
  },
});
