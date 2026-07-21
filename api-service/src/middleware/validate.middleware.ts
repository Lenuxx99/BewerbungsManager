import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { z, type ZodTypeAny } from "zod";

type ValidatedRequestData = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export function validate(schema: ZodTypeAny) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      res.status(400).json({
        message: "Validierungsfehler",
        errors: z.treeifyError(result.error),
      });

      return;
    }

    const data = result.data as ValidatedRequestData;

    if (data.body !== undefined) {
      req.body = data.body;
    }

    next();
  };
}