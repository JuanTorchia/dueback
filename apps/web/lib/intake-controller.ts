import { acceptUpload } from "@dueback/channel-adapters/upload";
import type { IntakeService } from "@dueback/runtime/intake-service";
import { redactedPublicError } from "./security-limits";

export interface IntakeControllerDependencies {
  readonly authenticate: (request: Request) => Promise<{ uid: string }>;
  readonly service: IntakeService;
  readonly now: () => string;
}

export async function handleIntake(
  request: Request,
  dependencies: IntakeControllerDependencies
): Promise<Response> {
  try {
    const owner = await dependencies.authenticate(request);
    const form = await request.formData();
    const text = form.get("text");
    const file = form.get("file");
    const receivedAt = dependencies.now();
    const input =
      typeof text === "string" && text.trim().length > 0
        ? { declaredMediaType: "text/plain", bytes: new TextEncoder().encode(text), receivedAt }
        : file instanceof File
          ? {
              declaredMediaType: file.type,
              bytes: new Uint8Array(await file.arrayBuffer()),
              receivedAt
            }
          : undefined;
    if (!input) return Response.json({ error: "PROMISE_SOURCE_REQUIRED" }, { status: 400 });
    const accepted = acceptUpload(input);
    const content =
      accepted.mediaType === "text/plain"
        ? new TextDecoder().decode(accepted.sanitizedBytes)
        : {
            dataUrl: `data:${accepted.mediaType};base64,${Buffer.from(accepted.sanitizedBytes).toString("base64")}`,
            contentType: accepted.mediaType
          };
    const result = await dependencies.service.intake(
      {
        artifactId: accepted.artifactId,
        ownerId: owner.uid,
        sourceChannel: typeof text === "string" ? "paste" : "upload",
        sha256: accepted.sha256,
        content
      },
      receivedAt
    );
    return Response.json(
      {
        caseId: result.draft.caseId,
        duplicate: result.duplicate,
        activationBlocked: result.draft.activationBlocked,
        blockingFields: result.draft.blockingFields
      },
      { status: result.duplicate ? 200 : 201 }
    );
  } catch (cause) {
    const error = redactedPublicError(cause);
    const candidateStatus =
      "status" in Object(cause) ? (cause as { status?: unknown }).status : undefined;
    const status =
      typeof candidateStatus === "number" && candidateStatus >= 400 && candidateStatus <= 599
        ? candidateStatus
        : 422;
    return Response.json({ error }, { status });
  }
}
