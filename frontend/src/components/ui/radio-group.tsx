"use client";

import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);

export function RadioGroup({ value = "", onValueChange, children, className, disabled }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider
      value={{
        value,
        onValueChange: onValueChange || (() => {}),
        disabled
      }}
    >
      <div className={cn("grid gap-2", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

function useRadioGroup() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within RadioGroup");
  }
  return context;
}

export function RadioGroupItem({
  value,
  id,
  className,
  disabled: itemDisabled
}: {
  value: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { value: selectedValue, onValueChange, disabled: groupDisabled } = useRadioGroup();
  const isSelected = selectedValue === value;
  const disabled = groupDisabled || itemDisabled;

  return (
    <button
      type="button"
      id={id}
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-gray-300 text-gray-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isSelected && "border-gray-900",
        className
      )}
    >
      {isSelected && (
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      )}
    </button>
  );
}
