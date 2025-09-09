import type { ApplyProgressUpdate } from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import type { ProgressUpdate } from "@/app/api/ns/[nsId]/mappings/compare/route";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { FC } from "react";

type Props = {
  progress: ProgressUpdate | ApplyProgressUpdate;
  title: string;
};

export const ProgressDisplay: FC<Props> = ({ progress, title }) => {
  if (progress.type === "error") {
    return (
      <div className="border border-destructive/20 bg-destructive/5 dark:border-destructive/30 dark:bg-destructive/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-destructive font-medium mb-2">
          <XCircle size={20} />
          {title} - エラー
        </div>
        <div className="text-destructive/80">{progress.error}</div>
      </div>
    );
  }

  if (progress.type === "complete") {
    return (
      <div className="border border-green-500/20 bg-green-500/5 dark:border-green-400/30 dark:bg-green-400/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
          <CheckCircle size={20} />
          {title} - 完了
        </div>
      </div>
    );
  }

  // progress.type === "progress"
  return (
    <div className="border border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-primary font-medium mb-4">
        <Clock size={20} />
        {title} - 処理中
      </div>

      <div className="space-y-4">
        {Object.entries(progress.services).map(
          ([serviceName, serviceProgress]) => {
            const percentage =
              serviceProgress.total === "unknown" || serviceProgress.total === 0
                ? serviceProgress.status === "completed"
                  ? 100
                  : 0
                : Math.min(
                    100,
                    Math.round(
                      (serviceProgress.current / serviceProgress.total) * 100,
                    ),
                  );

            const getStatusIcon = () => {
              switch (serviceProgress.status) {
                case "completed":
                  return (
                    <CheckCircle
                      size={16}
                      className="text-green-600 dark:text-green-400"
                    />
                  );
                case "error":
                  return <XCircle size={16} className="text-destructive" />;
                case "in_progress":
                  return <Clock size={16} className="text-primary" />;
                case "pending":
                  return (
                    <AlertCircle size={16} className="text-muted-foreground" />
                  );
                default:
                  return null;
              }
            };

            const getStatusColor = () => {
              switch (serviceProgress.status) {
                case "completed":
                  return "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30";
                case "error":
                  return "text-destructive bg-destructive/10";
                case "in_progress":
                  return "text-primary bg-primary/10";
                case "pending":
                  return "text-muted-foreground bg-muted";
                default:
                  return "text-muted-foreground bg-muted";
              }
            };

            return (
              <div key={serviceName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="font-medium capitalize">
                      {serviceName}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}
                  >
                    {serviceProgress.status === "in_progress" && (
                      <>
                        {serviceProgress.current}
                        {serviceProgress.total !== "unknown" && (
                          <>
                            /{serviceProgress.total}
                            {(serviceName === "discord" ||
                              serviceName === "vrchat") && (
                              <span className="text-xs text-muted-foreground">
                                (概算)
                              </span>
                            )}
                          </>
                        )}
                        {/* 適用時は成功/失敗数を表示 */}
                        {"success" in serviceProgress &&
                          "errors" in serviceProgress && (
                            <span className="ml-2">
                              (成功: {serviceProgress.success as number}, 失敗:{" "}
                              {serviceProgress.errors as number})
                            </span>
                          )}
                      </>
                    )}
                    {serviceProgress.status === "completed" && (
                      <>
                        完了 ({serviceProgress.current}
                        {serviceProgress.total !== "unknown" && (
                          <>
                            /{serviceProgress.total}
                            {(serviceName === "discord" ||
                              serviceName === "vrchat") && (
                              <span className="text-xs text-muted-foreground">
                                (概算)
                              </span>
                            )}
                          </>
                        )}
                        )
                        {"success" in serviceProgress &&
                          "errors" in serviceProgress && (
                            <span className="ml-2">
                              (成功: {serviceProgress.success as number}, 失敗:{" "}
                              {serviceProgress.errors as number})
                            </span>
                          )}
                      </>
                    )}
                    {serviceProgress.status === "error" && "エラー"}
                    {serviceProgress.status === "pending" && "待機中"}
                  </div>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="text-sm text-muted-foreground">
                  {serviceProgress.message}
                  {serviceProgress.status === "error" &&
                    serviceProgress.error && (
                      <span className="text-destructive ml-2">
                        ({serviceProgress.error})
                      </span>
                    )}
                </div>
              </div>
            );
          },
        )}
      </div>

      {"currentMember" in progress && progress.currentMember && (
        <div className="mt-4 p-3 bg-background dark:bg-card rounded border">
          <div className="text-sm font-medium text-foreground">
            処理中のメンバー: {progress.currentMember}
          </div>
        </div>
      )}
    </div>
  );
};
