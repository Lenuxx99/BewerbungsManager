type Application = {
    id: number;
    firma: string;
    stelle: string;
    datum: string;
};

type DailyApplicationsProps = {
    apps: Application[];
    dailyGoal?: number;
    variant?: "popup" | "panel";
    visible?: boolean;
};
export function getTodayApplicationsCount(
    apps: { datum: string }[]
) {
    const today = new Date();

    return apps.filter((app) => {
        const date = new Date(app.datum);

        if (Number.isNaN(date.getTime())) {
            return false;
        }

        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    }).length;
}
import "../styles/DailyApplications.css";
export function DailyApplications({
    apps,
    dailyGoal = 5,
    variant = "panel",
    visible = true,
}: DailyApplicationsProps) {

    const count = getTodayApplicationsCount(apps);

    const progress = Math.min(
        (count / dailyGoal) * 100,
        100
    );
    
    const goalReached = count >= dailyGoal;

    if (!visible) {
        return null;
    }

    return (
        <div
            className={`daily-applications daily-applications-${variant} ${goalReached ? "daily-applications-complete" : ""
                }`}
        >
            <div className="daily-applications-header">
                <div className="daily-applications-icon">
                    {goalReached ? "✓" : "B"}
                </div>

                <div>
                    <span className="daily-applications-label">
                        Tagesziel
                    </span>

                    <strong>
                        Bewerbungen heute
                    </strong>
                </div>
            </div>

            <div className="daily-applications-count">
                <strong>{count}</strong>

                <span>/ {dailyGoal}</span>
            </div>

            <div className="daily-progress">
                <div
                    className="daily-progress-value"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>

            <p className="daily-applications-message">
                {goalReached
                    ? "Tagesziel erreicht!"
                    : count === 0
                        ? "Heute noch keine Bewerbung hinzugefügt."
                        : `Noch ${dailyGoal - count} ${dailyGoal - count === 1
                            ? "Bewerbung"
                            : "Bewerbungen"
                        } bis zum Tagesziel.`}
            </p>
        </div>
    );
}



