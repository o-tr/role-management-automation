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
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
          <XCircle size={20} />
          {title} - エラー
        </div>
        <div className="text-red-600">{progress.error}</div>
      </div>
    );
  }

  if (progress.type === "complete") {
    return (
      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
        <div className="flex items-center gap-2 text-green-800 font-medium">
          <CheckCircle size={20} />
          {title} - 完了
        </div>
      </div>
    );
  }

  // progress.type === "progress"
  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
      <div className="flex items-center gap-2 text-blue-800 font-medium mb-4">
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
                  return <CheckCircle size={16} className="text-green-600" />;
                case "error":
                  return <XCircle size={16} className="text-red-600" />;
                case "in_progress":
                  return <Clock size={16} className="text-blue-600" />;
                case "pending":
                  return <AlertCircle size={16} className="text-gray-400" />;
                default:
                  return null;
              }
            };

            const getStatusColor = () => {
              switch (serviceProgress.status) {
                case "completed":
                  return "text-green-700 bg-green-100";
                case "error":
                  return "text-red-700 bg-red-100";
                case "in_progress":
                  return "text-blue-700 bg-blue-100";
                case "pending":
                  return "text-gray-700 bg-gray-100";
                default:
                  return "text-gray-700 bg-gray-100";
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
                              <span className="text-xs text-gray-500">
                                (概算)
                              </span>
                            )}
                          </>
                        )}
                        {/* 適用時は成功/失敗数を表示 */}
                        {"success" in serviceProgress && (
                          <span className="ml-2">
                            (成功: {serviceProgress.success}, 失敗:{" "}
                            {serviceProgress.errors})
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
                              <span className="text-xs text-gray-500">
                                (概算)
                              </span>
                            )}
                          </>
                        )}
                        )
                        {"success" in serviceProgress && (
                          <span className="ml-2">
                            (成功: {serviceProgress.success}, 失敗:{" "}
                            {serviceProgress.errors})
                          </span>
                        )}
                      </>
                    )}
                    {serviceProgress.status === "error" && "エラー"}
                    {serviceProgress.status === "pending" && "待機中"}
                  </div>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="text-sm text-gray-600">
                  {serviceProgress.message}
                  {serviceProgress.status === "error" &&
                    serviceProgress.error && (
                      <span className="text-red-600 ml-2">
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
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="text-sm font-medium text-gray-700">
            処理中のメンバー: {progress.currentMember}
          </div>
        </div>
      )}
    </div>
  );
};
