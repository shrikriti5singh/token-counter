import { Router, type IRouter } from "express";
import { TokeniseTextBody, TokeniseTextResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function getTokeniseEndpoint(): string | null {
  const configuredUrl = process.env["TOKENISE_UPSTREAM_URL"]?.trim();
  if (!configuredUrl) return null;

  return configuredUrl.endsWith("/tokenise")
    ? configuredUrl
    : `${configuredUrl.replace(/\/+$/, "")}/tokenise`;
}

router.post("/tokenise", async (req, res) => {
  const parsedBody = TokeniseTextBody.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Enter text in a valid tokenization request." });
    return;
  }

  const endpoint = getTokeniseEndpoint();
  if (!endpoint) {
    res.status(503).json({
      error: "The tokenization service is not configured yet.",
    });
    return;
  }

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsedBody.data),
    });

    if (!upstreamResponse.ok) {
      req.log.warn(
        { statusCode: upstreamResponse.status },
        "Tokenization upstream returned an error",
      );
      res.status(502).json({
        error: "The tokenization service could not process this request.",
      });
      return;
    }

    const upstreamPayload: unknown = await upstreamResponse.json();
    const parsedResponse = TokeniseTextResponse.safeParse(upstreamPayload);

    if (!parsedResponse.success) {
      req.log.error("Tokenization upstream returned an invalid response");
      res.status(502).json({
        error: "The tokenization service returned an invalid response.",
      });
      return;
    }

    res.json(parsedResponse.data);
  } catch (error) {
    req.log.error({ err: error }, "Tokenization upstream request failed");
    res.status(502).json({
      error: "The tokenization service is unavailable right now.",
    });
  }
});

export default router;