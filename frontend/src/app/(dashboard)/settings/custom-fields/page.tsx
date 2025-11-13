"use client";

/**
 * Custom Fields Manager Page
 * Manage custom fields for all entity types
 */

import React, { useState } from "react";
import {
  useCustomFieldsByEntity,
  useCreateCustomField,
  useUpdateCustomField,
  useDeleteCustomField,
  useRestoreCustomField,
  useReorderCustomFields,
} from "@/hooks/useCustomFields";
import {
  EntityType,
  CustomField,
  CustomFieldFormData,
  ENTITY_TYPE_OPTIONS,
  getFieldTypeIcon,
  getFieldTypeLabel,
} from "@/types/customField";
import { CustomFieldBuilder } from "@/components/features/CustomFieldBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreVertical, Edit, Trash2, GripVertical, Archive, ArchiveRestore } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function CustomFieldsPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("product");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<CustomField | null>(null);

  const { data: customFields, isLoading } = useCustomFieldsByEntity(selectedEntity, false);
  const createMutation = useCreateCustomField();
  const updateMutation = useUpdateCustomField();
  const deleteMutation = useDeleteCustomField();
  const restoreMutation = useRestoreCustomField();
  const reorderMutation = useReorderCustomFields();

  const handleCreate = (data: CustomFieldFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: CustomFieldFormData) => {
    if (editingField) {
      updateMutation.mutate({
        id: editingField._id,
        updates: data,
      });
      setEditingField(null);
    }
  };

  const handleDelete = () => {
    if (fieldToDelete) {
      deleteMutation.mutate({ id: fieldToDelete._id, hardDelete: false });
      setFieldToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleRestore = (field: CustomField) => {
    restoreMutation.mutate(field._id);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !customFields) return;

    const items = Array.from(customFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const fieldOrders = items.map((item, index) => ({
      id: item._id,
      order: index,
    }));

    reorderMutation.mutate(fieldOrders);
  };

  const openBuilder = () => {
    setEditingField(null);
    setIsBuilderOpen(true);
  };

  const openEditor = (field: CustomField) => {
    setEditingField(field);
    setIsBuilderOpen(true);
  };

  const confirmDelete = (field: CustomField) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const closeBuilder = () => {
    setIsBuilderOpen(false);
    setEditingField(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Fields</h1>
          <p className="text-muted-foreground">
            Add custom fields to any entity in your inventory system
          </p>
        </div>
        <Button onClick={openBuilder}>
          <Plus className="mr-2 h-4 w-4" />
          New Custom Field
        </Button>
      </div>

      <Tabs value={selectedEntity} onValueChange={(value) => setSelectedEntity(value as EntityType)}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {ENTITY_TYPE_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              <span className="mr-2">{option.icon}</span>
              <span className="hidden md:inline">{option.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {ENTITY_TYPE_OPTIONS.map((entityOption) => (
          <TabsContent key={entityOption.value} value={entityOption.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{entityOption.icon}</span>
                  <span>{entityOption.label} Custom Fields</span>
                </CardTitle>
                <CardDescription>
                  {customFields?.length || 0} custom field(s) defined
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading custom fields...
                  </div>
                ) : !customFields || customFields.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No custom fields defined for {entityOption.label.toLowerCase()}
                    </p>
                    <Button onClick={openBuilder} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Field
                    </Button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="custom-fields">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {customFields.map((field, index) => (
                            <Draggable
                              key={field._id}
                              draggableId={field._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-4 p-4 border rounded-lg bg-background ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  } ${!field.isActive ? "opacity-60" : ""}`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">
                                        {getFieldTypeIcon(field.fieldType)}
                                      </span>
                                      <h3 className="font-semibold truncate">
                                        {field.fieldLabel}
                                      </h3>
                                      {field.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                      {!field.isActive && (
                                        <Badge variant="secondary" className="text-xs">
                                          Archived
                                        </Badge>
                                      )}
                                      {field.section && (
                                        <Badge variant="outline" className="text-xs">
                                          {field.section}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                      <code className="bg-muted px-2 py-0.5 rounded">
                                        {field.fieldName}
                                      </code>
                                      <span>•</span>
                                      <span>{getFieldTypeLabel(field.fieldType)}</span>
                                      {field.helpText && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate max-w-xs">
                                            {field.helpText}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditor(field)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      {field.isActive ? (
                                        <DropdownMenuItem onClick={() => confirmDelete(field)}>
                                          <Archive className="mr-2 h-4 w-4" />
                                          Archive
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={() => handleRestore(field)}>
                                          <ArchiveRestore className="mr-2 h-4 w-4" />
                                          Restore
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => confirmDelete(field)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Permanently
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Custom Field Builder Dialog */}
      <CustomFieldBuilder
        open={isBuilderOpen}
        onClose={closeBuilder}
        onSubmit={editingField ? handleUpdate : handleCreate}
        initialData={editingField ? editingField : undefined}
        entityType={selectedEntity}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the custom field "{fieldToDelete?.fieldLabel}".
              Existing data will be preserved but the field will no longer be visible in forms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
