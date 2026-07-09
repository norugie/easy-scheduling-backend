import { Router } from "express";
import { login, logout, me, refresh } from "../controllers/auth.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schemas.js";

export const authRouter = Router();

authRouter.post("/login", validateRequest({ body: loginSchema }), asyncHandler(login));
authRouter.post("/refresh", asyncHandler(refresh));
authRouter.post("/logout", asyncHandler(logout));
authRouter.get("/me", requireAuth, me);
