export const ALERT_TYPES = [
    "motion",
    "glass_break",
    "unauthorized_access",
    "camera_offline",
    "object_moved",
    "window_open",
    "power_failure",
];

export const INCIDENT_CAUSES = [
    "visitor",
    "employee",
    "security",
    "cleaning_staff",
    "maintenance",
    "unknown",
];

/** bestimmt die schwere eines alerts. */
export function determineSeverity(type) {
    const severityByType = {
        camera_offline: "low",
        power_failure: "low",
        motion: "medium",
        window_open: "medium",
        object_moved: "high",
        glass_break: "critical",
        unauthorized_access: "critical",
    };

    return severityByType[type];
}
