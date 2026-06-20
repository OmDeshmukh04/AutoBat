import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      service: "autobat-api",
      status: "ok"
    };
  }
}

