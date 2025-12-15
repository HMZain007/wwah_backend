const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WWAH Backend API Documnets list",
      version: "1.0.0",
      description: "API documentation for your wwah backend",
    },
  },

  // Path of your route files
  apis: ["./routers/**/*.js"],

};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
