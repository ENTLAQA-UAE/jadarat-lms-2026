import { Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function TwoColumnLearningOutcomesCard({ outcomes }: { outcomes: { id: string; text: string }[] }) {
    if (outcomes.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold ">What you&apos;ll learn</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground text-sm">No learning outcomes found.</p>
                </CardContent>
            </Card>
        );
    }

    const midpoint = Math.ceil(outcomes.length / 2);
    const leftColumnOutcomes = outcomes.slice(0, midpoint);
    const rightColumnOutcomes = outcomes.slice(midpoint);

    const OutcomeList = ({ items }: { items: { id: string; text: string }[] }) => (
        <ul className="md:space-y-2">
            {items.map((outcome) => (
                <li key={outcome.id} className="flex items-center gap-2 mt-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground text-sm exclude-weglot">{outcome.text}</span>
                </li>
            ))}
        </ul>
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">What you&apos;ll learn</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 md:gap-6">
                    <OutcomeList items={leftColumnOutcomes} />
                    <OutcomeList items={rightColumnOutcomes} />
                </div>
            </CardContent>
        </Card>
    );
}