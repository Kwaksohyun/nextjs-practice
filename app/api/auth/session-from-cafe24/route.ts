import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { verifyCafe24AppHmac } from "@/lib/cafe24/verifyHmac";
import { config } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import { shopsTable } from "@/lib/db";

/**
 * 카페24 앱 실행 URL → HMAC 검증 → 세션 → 대시보드
 * 카페24 개발자센터 앱 URL을 이 경로로 두거나, 홈(/)에서 쿼리 원문 그대로 넘겨야 합니다.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const mall_id = searchParams.get("mall_id");
    const user_id = searchParams.get("user_id");
    const shop_no = searchParams.get("shop_no");
    const timestamp = searchParams.get("timestamp");
    const hmac = searchParams.get("hmac");

    if (!mall_id) {
      return NextResponse.json(
        {
          success: false,
          error: "mall_id parameter is required",
          code: "MISSING_MALL_ID",
        },
        { status: 400 },
      );
    }

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id parameter is required",
          code: "MISSING_USER_ID",
        },
        { status: 400 },
      );
    }

    if (hmac) {
      // 앱 실행 URL HMAC = 개발자센터의 Client Secret (Service Key 아님)
      const secrets = [config.cafe24.clientSecret].filter(Boolean);

      if (secrets.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "CAFE24_CLIENT_SECRET or CAFE24_SERVICE_KEY not set",
            code: "MISSING_SECRET",
          },
          { status: 500 },
        );
      }

      const isValid = verifyCafe24AppHmac(req.url, secrets);
      if (!isValid) {
        logger.warn("HMAC 검증 실패", {
          mall_id,
          url: req.url.split("?")[0],
        });
        return NextResponse.json(
          {
            success: false,
            error: "Invalid HMAC",
            code: "INVALID_HMAC",
            hint:
              "카페24 개발자센터 > 해당 앱 > 개발 정보의 Client Secret이 Vercel CAFE24_CLIENT_SECRET과 동일한지 확인하세요. 환경변수 변경 후 재배포하고, 카페24에서 앱을 다시 실행해 새 URL로 접속하세요.",
          },
          { status: 401 },
        );
      }
    } else if (config.app.isProduction) {
      return NextResponse.json(
        {
          success: false,
          error: "HMAC parameter is required in production",
          code: "MISSING_HMAC",
        },
        { status: 400 },
      );
    }

    if (!timestamp) {
      return NextResponse.json(
        {
          success: false,
          error: "timestamp parameter is required",
          code: "MISSING_TIMESTAMP",
        },
        { status: 400 },
      );
    }

    const requestTime = parseInt(timestamp, 10) * 1000;
    const timeDiff = Math.abs(Date.now() - requestTime);
    const maxAge = 2 * 60 * 60 * 1000;

    if (timeDiff > maxAge) {
      return NextResponse.json(
        {
          success: false,
          error: "Request timestamp is too old",
          code: "TIMESTAMP_TOO_OLD",
        },
        { status: 401 },
      );
    }

    const { data: shop, error: shopError } = await shopsTable()
      .select("*")
      .eq("mall_id", mall_id)
      .single();

    const baseUrl =
      config.app.url ||
      process.env.NEXT_PUBLIC_APP_URL ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (shopError || !shop) {
      return NextResponse.redirect(
        `${baseUrl}/?mall_id=${mall_id}&oauth_required=true`,
      );
    }

    if (!shop.access_token || !shop.refresh_token) {
      return NextResponse.redirect(
        `${baseUrl}/?mall_id=${mall_id}&oauth_required=true`,
      );
    }

    const sessionToken = await createSession({
      mall_id,
      user_id: user_id || undefined,
      shop_no: shop_no || undefined,
    });

    const redirectUrl = `${baseUrl}/dashboard?mall_id=${mall_id}`;
    const response = NextResponse.redirect(redirectUrl);
    return setSessionCookie(response, sessionToken);
  } catch (error) {
    logger.error("session-from-cafe24 오류", { error });
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
