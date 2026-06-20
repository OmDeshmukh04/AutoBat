import { otpRequestSchema, otpVerifySchema } from "@autobat/contracts";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthGuard, type AuthedRequest } from "./auth.guard";
import { signToken } from "./jwt.util";
import { Req } from "@nestjs/common";

// Mock OTP: always 123456, valid 5 minutes. Swap for a real SMS provider later.
const MOCK_OTP = "123456";

@Controller("auth")
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("request-otp")
  async requestOtp(@Body() body: unknown) {
    const parsed = otpRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException("Invalid mobile number");
    }

    const user = await this.prisma.user.findUnique({
      where: { mobile: parsed.data.mobile }
    });
    if (!user || !user.active) {
      // Do not reveal whether the number exists.
      return { sent: true, devCode: MOCK_OTP };
    }

    await this.prisma.otpChallenge.create({
      data: {
        userId: user.id,
        code: MOCK_OTP,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    // devCode is returned only because this is the mock provider.
    return { sent: true, devCode: MOCK_OTP };
  }

  @Post("verify-otp")
  async verifyOtp(@Body() body: unknown) {
    const parsed = otpVerifySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException("Invalid request");
    }

    const user = await this.prisma.user.findUnique({
      where: { mobile: parsed.data.mobile },
      include: { org: true }
    });
    if (!user || !user.active) {
      throw new UnauthorizedException("Login failed");
    }

    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { userId: user.id, consumed: false },
      orderBy: { createdAt: "desc" }
    });

    const valid =
      challenge &&
      challenge.code === parsed.data.code &&
      challenge.expiresAt > new Date();

    if (!valid) {
      throw new UnauthorizedException("Invalid or expired code");
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumed: true }
    });

    const token = signToken({
      sub: user.id,
      role: user.role,
      orgId: user.orgId
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        orgId: user.orgId,
        orgName: user.org?.name ?? null
      }
    };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@Req() req: AuthedRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { org: true }
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      orgId: user.orgId,
      orgName: user.org?.name ?? null
    };
  }
}
