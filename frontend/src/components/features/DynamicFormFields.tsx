"use client";

/**
 * Dynamic Form Fields Component
 * Renders custom fields for any entity type dynamically
 */

import React from "react";
import { useCustomFieldsByEntity } from "@/hooks/useCustomFields";
import { EntityType, CustomFieldValue } from "@/types/customField";
import { CustomFieldInput } from "./customFields/CustomFieldInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DynamicFormFieldsProps {
  entityType: EntityType;
  values: CustomFieldValue;
  onChange: (values: CustomFieldValue) => void;
  errors?: Record<string, string>;
}

export function DynamicFormFields({
  entityType,
  values,
  onChange,
  errors = {},
}: DynamicFormFieldsProps) {
  const { data: customFields, isLoading } = useCustomFieldsByEntity(entityType);

  const handleFieldChange = (fieldName: string, value: any) => {
    onChange({
      ...values,
      [fieldName]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customFields || customFields.length === 0) {
    return null;
  }

  // Group fields by section
  const groupedFields = customFields.reduce((acc, field) => {
    const section = field.section || "Additional Information";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof customFields>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedFields).map(([section, fields], index) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-lg">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div
                  key={field._id}
                  className={
                    field.fieldType === "textarea" || field.fieldType === "json"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <CustomFieldInput
                    field={field}
                    value={values[field.fieldName]}
                    onChange={(value) => handleFieldChange(field.fieldName, value)}
                    error={errors[field.fieldName]}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
