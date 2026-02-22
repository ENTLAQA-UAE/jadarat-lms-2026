export const Gauge = ({
    value,
    size = "small",
    showValue = true,
    color = "text-primary-400",
    bgcolor = "text-muted",
}: {
    value: number;
    size: "small" | "medium" | "large";
    showValue: boolean;
    color?: String;
    bgcolor?: String;
}) => {
    const circumference = 332; //2 * Math.PI * 53; // 2 * pi * radius
    const valueInCircumference = (value / 100) * circumference;
    const strokeDasharray = `${circumference} ${circumference}`;
    const initialOffset = circumference;
    const strokeDashoffset = initialOffset - valueInCircumference;

    const sizes = {
        small: {
            width: "50",
            height: "50",
            textSize: "text-s",
        },
        medium: {
            width: "72",
            height: "72",
            textSize: "text-base",
        },
        large: {
            width: "144",
            height: "144",
            textSize: "text-3xl",
        },
    };

    return (
        <div className="flex flex-col text-foreground items-center justify-center relative">
            <svg
                fill="none"
                shapeRendering="crispEdges"
                height={sizes[size].height}
                width={sizes[size].width}
                viewBox="0 0 120 120"
                strokeWidth="2"
                className="transform -rotate-90"
            >
                <circle
                    className={`${bgcolor}`}
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    shapeRendering="geometricPrecision"
                    r="53"
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`animate-gauge_fill ${color}`}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={initialOffset}
                    shapeRendering="geometricPrecision"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="53"
                    cx="60"
                    cy="60"
                    style={{
                        strokeDashoffset: strokeDashoffset,
                        transition: "stroke-dasharray 1s ease 0s,stroke 1s ease 0s",
                    }}
                />
            </svg>
            {showValue ? (
                <div className="absolute flex   justify-center items-center animate-gauge_fadeIn">
                    <span className={` flex  mt-2 ${color}  ${sizes[size].textSize}`}>{value}%</span>
                </div>
            ) : null}
        </div>
    );
};