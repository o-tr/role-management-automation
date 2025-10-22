import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  errors: string[];
  title?: string;
};

export const ValidationError: React.FC<Props> = ({
  errors,
  title = "入力エラー",
}) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-1">{title}</div>
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error) => (
            <li key={error} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
