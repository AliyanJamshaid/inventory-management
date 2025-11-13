"use client";

/**
 * Custom Field Input Component
 * Generic component that renders the appropriate input based on field type
 */

import React from "react";
import { CustomField } from "@/types/customField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface CustomFieldInputProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function CustomFieldInput({
  field,
  value,
  onChange,
  error,
}: CustomFieldInputProps) {
  const renderInput = () => {
    switch (field.fieldType) {
      case "text":
      case "email":
      case "phone":
      case "url":
        return (
          <Input
            type={field.fieldType === "email" ? "email" : field.fieldType === "url" ? "url" : "text"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={cn(error && "border-red-500")}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={cn(error && "border-red-500")}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className={cn(error && "border-red-500")}
          />
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => onChange(checked)}
            />
            <Label className="text-sm text-muted-foreground">
              {value === true || value === "true" ? "Yes" : "No"}
            </Label>
          </div>
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className={cn(error && "border-red-500")}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.validation?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.validation?.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option));
                    }
                  }}
                />
                <Label className="text-sm font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // In a real app, you'd upload the file and get a URL
                // For now, we'll just store the file name
                onChange(file.name);
              }
            }}
            className={cn(error && "border-red-500")}
          />
        );

      case "json":
        return (
          <Textarea
            value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                // If it's not valid JSON yet, store as string
                onChange(e.target.value);
              }
            }}
            placeholder={field.placeholder || '{"key": "value"}'}
            required={field.required}
            rows={6}
            className={cn("font-mono text-sm", error && "border-red-500")}
          />
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(error && "border-red-500")}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldName}>
        {field.fieldLabel}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
