"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { format } from "date-fns";

export function InteractionSummaryDialog({
  open,
  onOpenChange,
  summary,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  summary: any;
}) {
  if (!summary) return null;

  const {
    upvoteCount,
    downvoteCount,
    reportCount,
    flagCount,
    netScore,
    userInteractions = [],
  } = summary;

  const totalVotes = upvoteCount + downvoteCount || 1;
  const positivePercent = Math.max(0, (upvoteCount / totalVotes) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Meme Interaction Summary</DialogTitle>
        </DialogHeader>

        <Card className="shadow-none border-none">
          <CardContent className="px-6 pb-6 space-y-6">

            {/* SCORE CARD */}
            <div className="p-4 rounded-xl bg-muted space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">Net Score</p>
                <Badge variant={netScore >= 0 ? "default" : "destructive"}>
                  {netScore}
                </Badge>
              </div>

              <Progress value={positivePercent} className="h-2" />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{upvoteCount} Upvotes</span>
                <span>{downvoteCount} Downvotes</span>
              </div>
            </div>

            {/* STAT GRID */}
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Upvotes" value={upvoteCount} />
              <Stat label="Downvotes" value={downvoteCount} />

              <Stat label="Reports" value={reportCount} />
              <Stat label="Flags" value={flagCount} />
            </div>

            <Separator />

            {/* USER INTERACTIONS */}
            <div className="space-y-3">
              <p className="font-medium">User Interactions</p>

              <div className="space-y-2">
                {userInteractions.map((i: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border bg-card flex flex-col gap-1"
                  >
                    <div className="flex justify-between">
                      <Badge
                        variant={
                          i.type === "DOWNVOTE"
                            ? "destructive"
                            : i.type === "FLAG"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {i.type}
                      </Badge>

                      <span className="text-xs text-muted-foreground">
                        {format(new Date(i.createdAt), "PPp")}
                      </span>
                    </div>

                    {i.reason && (
                      <p className="text-xs text-muted-foreground">
                        Reason: {i.reason}
                      </p>
                    )}
                    {i.note && (
                      <p className="text-xs text-muted-foreground">Note: {i.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border bg-card text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
