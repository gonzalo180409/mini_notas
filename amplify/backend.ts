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

// 7. Ruta: /notas (con IAM authorization)
const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});

const itemsPath = myRestApi.root.addResource("notas");

// Métodos para /notas
itemsPath.addMethod("GET", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});
itemsPath.addMethod("POST", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});
itemsPath.addMethod("DELETE", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});
itemsPath.addMethod("PUT", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

// Opción de proxy para más rutas bajo /notas/*
itemsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});

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
