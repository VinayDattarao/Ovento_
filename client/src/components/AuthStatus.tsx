import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AuthStatus() {
  const { authMethod, isFirebaseConfigured } = useAuth();

  if (authMethod === 'detecting') {
    return null;
  }

  const getStatusInfo = () => {
    if (authMethod === 'firebase') {
      return {
        label: "Firebase Auth",
        color: "bg-green-500" as const,
        description: "Using Google Firebase authentication with real Google sign-in"
      };
    } else {
      return {
        label: "Demo Mode",
        color: "bg-blue-500" as const,
        description: isFirebaseConfigured 
          ? "Firebase failed, using demo authentication as fallback"
          : "Firebase not configured, using demo authentication"
      };
    }
  };

  const { label, color, description } = getStatusInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="secondary" 
            className={`${color} text-white hover:opacity-80 text-xs`}
          >
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}