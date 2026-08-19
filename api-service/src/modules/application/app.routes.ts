import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { applicationSchema } from "./app.schema";
import {
  createApplication,
  getApplications,
  deleteApplication,
  updateApplication,
  getApplicationsWithInterview
} from "./app.controller";

export const appRouter = Router();

appRouter.post(
  "/",
  authenticate,
  validate(applicationSchema),
  createApplication
);

appRouter.get(
  "/",
  authenticate,
  getApplications
);


appRouter.delete(
  "/:appId",
  authenticate,
  deleteApplication,
);

appRouter.patch(
  "/:appId",
  authenticate,
  updateApplication,
);

appRouter.get(
  "/termine",
  authenticate,
  getApplicationsWithInterview,
);