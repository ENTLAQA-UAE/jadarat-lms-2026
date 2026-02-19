export function formatDuration(duration: string) {
    // Check if duration already includes ":" (e.g., "25:55")
    if (typeof duration === 'string' && duration.includes(':')) {
        return duration;
    }

    // If duration is a number or a string without ":", assume it's in minutes
    const minutes = parseInt(duration, 10);
    const seconds = "00"; // default seconds for whole numbers

    return `${minutes}:${seconds}`;
}