"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import {
  Organization,
  SubscriptionDetails,
  SubscriptionRequest,
} from "./type";
import {
  getSubscriptionDetails,
  updateSubscription,
  getSubscriptionRequests,
  resolveSubscriptionRequest,
} from "@/action/super-admin/orgnizations/organizationsActions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner/loading-spinner";
import { Check, X, Users, BookOpen, UserCog, Calendar } from "lucide-react";

interface SubscriptionTier {
  id: string;
  tier_name: string;
  max_user: number;
  max_courses: number;
  max_lms_managers: number;
  create_courses: boolean;
  ai_builder: boolean;
  document_builder: boolean;
}

interface SubscriptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
  onUpdated: () => void;
}

export function SubscriptionSheet({
  open,
  onOpenChange,
  organization,
  onUpdated,
}: SubscriptionSheetProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);

  // Editable state
  const [selectedTierId, setSelectedTierId] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  );
  const [isActive, setIsActive] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!open || !organization) return;

    const loadData = async () => {
      setLoading(true);

      // Fetch tiers
      const { data: tiersData } = await supabase
        .from("subscription_tiers")
        .select(
          "id, tier_name, max_user, max_courses, max_lms_managers, create_courses, ai_builder, document_builder"
        );
      setTiers(tiersData || []);

      // Fetch subscription details
      const { details: subDetails } = await getSubscriptionDetails(
        organization.id
      );
      setDetails(subDetails);

      if (subDetails) {
        setSelectedTierId(subDetails.tierId);
        setStartDate(new Date(subDetails.startDate));
        setEndDate(new Date(subDetails.expiresAt));
        setIsActive(subDetails.isActive);
      }

      // Fetch pending requests
      const { requests: reqs } = await getSubscriptionRequests(
        organization.id
      );
      setRequests(reqs);

      setLoading(false);
    };

    loadData();
  }, [open, organization]);

  const selectedTier = tiers.find((t) => t.id === String(selectedTierId));

  const handleExtend = (months: number) => {
    const newEnd = new Date(endDate);
    newEnd.setMonth(newEnd.getMonth() + months);
    setEndDate(newEnd);
  };

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);

    const { success, errorMessage } = await updateSubscription(
      organization.id,
      selectedTierId,
      startDate.toISOString(),
      endDate.toISOString(),
      isActive
    );

    if (success) {
      toast.success("Success", { description: "Subscription updated." });
      onUpdated();
    } else {
      toast.error("Error", {
        description: errorMessage || "Failed to update subscription.",
      });
    }

    setSaving(false);
  };

  const handleResolve = async (
    requestId: number,
    status: "approved" | "dismissed"
  ) => {
    const { success, errorMessage } = await resolveSubscriptionRequest(
      requestId,
      status
    );

    if (success) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success("Success", {
        description: `Request ${status}.`,
      });
    } else {
      toast.error("Error", {
        description: errorMessage || "Failed to resolve request.",
      });
    }
  };

  const statusBadge = () => {
    if (!organization) return null;
    const variant =
      organization.status === "Active"
        ? "success"
        : organization.status === "Suspended"
        ? "warning"
        : "destructive";
    return <Badge variant={variant}>{organization.status}</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle>{organization?.name}</SheetTitle>
            {statusBadge()}
          </div>
          <SheetDescription>
            Manage subscription settings for this organization.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner color="#0A66C2" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Section 1: Subscription Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Subscription Details</h3>

              <div className="space-y-3">
                <div>
                  <Label>Subscription Tier</Label>
                  <Select
                    value={String(selectedTierId)}
                    onValueChange={(v) => setSelectedTierId(Number(v))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map((tier) => (
                        <SelectItem
                          key={tier.id}
                          value={tier.id}
                          className="exclude-weglot"
                        >
                          {tier.tier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <div className="mt-1">
                      <DatePicker
                        selectedDate={startDate}
                        onDateChange={(d) => d && setStartDate(d)}
                        placeholder="Start date"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <div className="mt-1">
                      <DatePicker
                        selectedDate={endDate}
                        onDateChange={(d) => d && setEndDate(d)}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Quick Extend</Label>
                  <div className="flex gap-2 mt-1">
                    {[
                      { label: "+1mo", months: 1 },
                      { label: "+3mo", months: 3 },
                      { label: "+6mo", months: 6 },
                      { label: "+1yr", months: 12 },
                    ].map(({ label, months }) => (
                      <Button
                        key={label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtend(months)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? <LoadingSpinner /> : "Save Changes"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Section 2: Tier Limits */}
            {selectedTier && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Tier Limits</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center p-3 border rounded-lg">
                    <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {selectedTier.max_user}
                    </span>
                    <span className="text-xs text-muted-foreground">Users</span>
                  </div>
                  <div className="flex flex-col items-center p-3 border rounded-lg">
                    <BookOpen className="h-4 w-4 mb-1 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {selectedTier.max_courses}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Courses
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 border rounded-lg">
                    <UserCog className="h-4 w-4 mb-1 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {selectedTier.max_lms_managers}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Creators
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    {selectedTier.create_courses ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                    Create Courses
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {selectedTier.ai_builder ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                    AI Builder
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {selectedTier.document_builder ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                    Document Builder
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Section 3: Pending Upgrade Requests */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Pending Upgrade Requests
                {requests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {requests.length}
                  </Badge>
                )}
              </h3>
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending requests.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Users:</span>{" "}
                          {req.numberOfUsers}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Courses:
                          </span>{" "}
                          {req.numberOfCourses}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Creators:
                          </span>{" "}
                          {req.numberOfContentCreators}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleResolve(req.id, "approved")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleResolve(req.id, "dismissed")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
