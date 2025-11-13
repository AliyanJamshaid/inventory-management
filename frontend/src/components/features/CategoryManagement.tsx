"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { Category, CreateCategoryDTO } from "@/types/product";
import { categoryCreateSchema } from "@/lib/validations/productSchema";

interface CategoryNodeProps {
  category: Category;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentId: string) => void;
}

function CategoryNode({
  category,
  level,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = category.path && category.path.length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 group"
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-5 h-5"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
        </button>

        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500" />
        )}

        <span className="flex-1 text-sm font-medium">{category.name}</span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge variant={category.isActive ? "default" : "secondary"}>
            {category.isActive ? "Active" : "Inactive"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddChild(category._id)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {category.description && (
        <p
          className="text-xs text-muted-foreground ml-11 mb-2"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          {category.description}
        </p>
      )}
    </div>
  );
}

interface CategoryFormProps {
  category?: Category;
  parentId?: string;
  categories: Category[];
  onSubmit: (data: CreateCategoryDTO) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function CategoryForm({
  category,
  parentId,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
}: CategoryFormProps) {
  const form = useForm<CreateCategoryDTO>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      parent: parentId || (typeof category?.parent === "object" ? category.parent._id : category?.parent) || undefined,
      isActive: category?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter category description"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="None (Root Category)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None (Root Category)</SelectItem>
                  {categories
                    .filter((c) => c._id !== category?._id)
                    .map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Leave empty to create a root category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value?.toString()}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function CategoryManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  const { data: categories = [], isLoading, error } = useCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = async (data: CreateCategoryDTO) => {
    await createCategory.mutateAsync(data);
    setShowCreateDialog(false);
    setParentId(undefined);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditDialog(true);
  };

  const handleUpdate = async (data: CreateCategoryDTO) => {
    if (selectedCategory) {
      await updateCategory.mutateAsync({ _id: selectedCategory._id, ...data });
      setShowEditDialog(false);
      setSelectedCategory(null);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      await deleteCategory.mutateAsync(selectedCategory._id);
      setShowDeleteDialog(false);
      setSelectedCategory(null);
    }
  };

  const handleAddChild = (parentId: string) => {
    setParentId(parentId);
    setShowCreateDialog(true);
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <CategoryNode
        key={category._id}
        category={category}
        level={level}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAddChild={handleAddChild}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load categories. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No categories yet. Create your first category to get started.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              {renderCategoryTree(categories)}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {parentId ? "Add Subcategory" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              Create a new category for organizing your products
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            parentId={parentId}
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => {
              setShowCreateDialog(false);
              setParentId(undefined);
            }}
            isSubmitting={createCategory.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              category={selectedCategory}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedCategory(null);
              }}
              isSubmitting={updateCategory.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This
              action cannot be undone and may affect products in this category.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
