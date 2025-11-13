"use client";

/**
 * Custom Field Builder Component
 * Form to create and edit custom fields
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CustomFieldFormData,
  EntityType,
  FieldType,
  FIELD_TYPE_OPTIONS,
  ENTITY_TYPE_OPTIONS,
} from "@/types/customField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

const customFieldSchema = z.object({
  entityType: z.string().min(1, "Entity type is required"),
  fieldName: z
    .string()
    .min(2, "Field name must be at least 2 characters")
    .max(50, "Field name cannot exceed 50 characters")
    .regex(/^[a-z][a-z0-9_]*$/, "Field name must start with a letter and contain only lowercase letters, numbers, and underscores"),
  fieldLabel: z
    .string()
    .min(2, "Field label must be at least 2 characters")
    .max(100, "Field label cannot exceed 100 characters"),
  fieldType: z.string().min(1, "Field type is required"),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  helpText: z.string().max(500, "Help text cannot exceed 500 characters").optional(),
  placeholder: z.string().max(200, "Placeholder cannot exceed 200 characters").optional(),
  order: z.number().min(0).optional(),
  section: z.string().max(100, "Section name cannot exceed 100 characters").optional(),
  isActive: z.boolean().default(true),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      options: z.array(z.string()).optional(),
    })
    .optional(),
});

type CustomFieldFormValues = z.infer<typeof customFieldSchema>;

interface CustomFieldBuilderProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomFieldFormData) => void;
  initialData?: Partial<CustomFieldFormData>;
  entityType?: EntityType;
}

export function CustomFieldBuilder({
  open,
  onClose,
  onSubmit,
  initialData,
  entityType,
}: CustomFieldBuilderProps) {
  const [newOption, setNewOption] = useState("");
  const [options, setOptions] = useState<string[]>(
    initialData?.validation?.options || []
  );

  const form = useForm<CustomFieldFormValues>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      entityType: entityType || initialData?.entityType || "",
      fieldName: initialData?.fieldName || "",
      fieldLabel: initialData?.fieldLabel || "",
      fieldType: initialData?.fieldType || "text",
      required: initialData?.required || false,
      defaultValue: initialData?.defaultValue,
      helpText: initialData?.helpText || "",
      placeholder: initialData?.placeholder || "",
      order: initialData?.order,
      section: initialData?.section || "",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
      validation: initialData?.validation || {},
    },
  });

  const selectedFieldType = form.watch("fieldType") as FieldType;
  const fieldName = form.watch("fieldName");

  // Auto-generate field name from field label
  const handleLabelChange = (label: string) => {
    if (!initialData?.fieldName) {
      const slugified = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      form.setValue("fieldName", slugified);
    }
  };

  // Add option for select/multiselect
  const addOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...options, newOption.trim()];
      setOptions(updatedOptions);
      form.setValue("validation.options", updatedOptions);
      setNewOption("");
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    form.setValue("validation.options", updatedOptions);
  };

  const handleSubmit = (data: CustomFieldFormValues) => {
    const formData: CustomFieldFormData = {
      ...data,
      entityType: data.entityType as EntityType,
      fieldType: data.fieldType as FieldType,
    };

    onSubmit(formData);
    form.reset();
    setOptions([]);
    onClose();
  };

  const needsOptions = selectedFieldType === "select" || selectedFieldType === "multiselect";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Custom Field" : "Create Custom Field"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the custom field configuration"
              : "Define a new custom field for your entities"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Entity Type */}
            <FormField
              control={form.control}
              name="entityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!entityType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENTITY_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Label */}
            <FormField
              control={form.control}
              name="fieldLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Warranty Period"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleLabelChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The display name for this field
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Name */}
            <FormField
              control={form.control}
              name="fieldName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., warranty_period"
                      {...field}
                      disabled={!!initialData?.fieldName}
                    />
                  </FormControl>
                  <FormDescription>
                    Internal name (lowercase, underscores only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Type */}
            <FormField
              control={form.control}
              name="fieldType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Options for Select/Multiselect */}
            {needsOptions && (
              <div className="space-y-3">
                <FormLabel>Options</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button type="button" onClick={addOption} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.map((option, index) => (
                    <Badge key={index} variant="secondary">
                      {option}
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {options.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add at least one option for select fields
                  </p>
                )}
              </div>
            )}

            {/* Min/Max for Number fields */}
            {selectedFieldType === "number" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validation.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validation.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Placeholder */}
            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Enter warranty period..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Help Text */}
            <FormField
              control={form.control}
              name="helpText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Help Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide additional context or instructions..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section */}
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Warranty Information" {...field} />
                  </FormControl>
                  <FormDescription>
                    Group related fields together
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Required & Active Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Required</FormLabel>
                      <FormDescription>
                        Field must be filled
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Show this field
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Field" : "Create Field"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
