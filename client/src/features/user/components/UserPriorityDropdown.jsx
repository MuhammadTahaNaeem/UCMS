import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", bgColor: "bg-green-100", textColor: "text-green-800", borderColor: "border-green-300" },
  { value: "medium", label: "Medium", bgColor: "bg-yellow-100", textColor: "text-yellow-800", borderColor: "border-yellow-300" },
  { value: "high", label: "High", bgColor: "bg-orange-100", textColor: "text-orange-800", borderColor: "border-orange-300" },
  { value: "urgent", label: "Critical", bgColor: "bg-red-100", textColor: "text-red-800", borderColor: "border-red-300" },
];

export function UserPriorityDropdown({ currentSuggestedPriority, onSuggestPriority, isUpdating }) {
  const [selectedPriority, setSelectedPriority] = useState(currentSuggestedPriority || "medium");

  const handleSuggest = async () => {
    if (selectedPriority !== currentSuggestedPriority) {
      await onSuggestPriority(selectedPriority);
    }
  };

  const getCurrentOption = (priority) => {
    return PRIORITY_OPTIONS.find((opt) => opt.value === priority) || PRIORITY_OPTIONS[1];
  };

  const currentOption = getCurrentOption(currentSuggestedPriority || "medium");
  const selectedOption = getCurrentOption(selectedPriority);
  const isChanged = selectedPriority !== currentSuggestedPriority;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Suggested Priority:</span>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${currentOption.bgColor} ${currentOption.textColor} border ${currentOption.borderColor}`}
        >
          {getCurrentOption(currentSuggestedPriority || "medium").label}
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${option.bgColor.replace("100", "500")}`}
                    ></div>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSuggest}
          disabled={!isChanged || isUpdating}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Suggesting..." : "Suggest"}
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Your suggested priority helps admins understand the urgency of your complaint.
      </p>
    </div>
  );
}
