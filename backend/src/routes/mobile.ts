import { Router } from "express";

export const mobileRouter = Router();

// Pattern #4: App Versioning & Configuration
mobileRouter.get("/app-config", (req, res) => {
    const platform = req.headers["x-platform"] as string;
    const appVersion = req.headers["x-app-version"] as string;

    // Mock configuration - in production this would come from DB/Redis
    const config = {
        minimum_version: "1.0.0",
        latest_version: "1.0.1",
        force_update: false, // Logic to compare appVersion vs minimum_version would go here
        update_url: platform === "ios"
            ? "https://apps.apple.com/app/id123456789"
            : "https://play.google.com/store/apps/details?id=com.fides.app",
        feature_flags: {
            new_home: true,
            dark_mode: true,
            maintenance_mode: false
        },
        maintenance: false,
        maintenance_message: null
    };

    res.json(config);
});

// Pattern #3: Mobile Optimized Error Testing
mobileRouter.get("/test-error", (_req, res) => {
    res.status(400).json({
        error: {
            code: "INVALID_INPUT",
            message: "Exemplo de erro formatado para mobile",
            user_message: "Por favor, verifique seus dados e tente novamente.",
            action: {
                type: "retry",
                retry: { allowed: true }
            }
        }
    });
});
