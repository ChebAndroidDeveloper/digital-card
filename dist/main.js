"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_security_1 = require("./common/http-security");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    (0, http_security_1.configureHttpSecurity)(app);
    app.enableShutdownHooks();
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Server is running on: http://localhost:${port}/graphql`);
}
bootstrap();
//# sourceMappingURL=main.js.map