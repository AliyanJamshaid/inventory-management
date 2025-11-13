'use client';

/**
 * Role Management Page
 * Manage roles and permissions
 */

import { useState } from 'react';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { PermissionGuard } from '@/components/features/PermissionGuard';
import { Role } from '@/types/permission';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Shield,
  Edit,
  Trash2,
  Copy,
  Users,
  Lock,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredRoles = roles?.filter((role) =>
    role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole.mutateAsync(selectedRole._id);
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and their permissions
          </p>
        </div>

        <PermissionGuard permission="settings.roles.create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </PermissionGuard>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredRoles?.length} {filteredRoles?.length === 1 ? 'role' : 'roles'}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles?.map((role) => (
          <Card key={role._id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{role.displayName}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {role.name}
                    </CardDescription>
                  </div>
                </div>

                {role.isSystemRole && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    System
                  </Badge>
                )}
              </div>

              {role.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {role.description}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Hierarchy: {role.hierarchy}</span>
                  </div>

                  <Badge variant="outline">
                    {role.permissions.length} permissions
                  </Badge>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {role.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Default Role
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <PermissionGuard permission="settings.roles.read">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </PermissionGuard>

                  <PermissionGuard permission="settings.roles.create">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </PermissionGuard>

                  <PermissionGuard permission="settings.roles.delete">
                    {!role.isSystemRole && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(role)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </PermissionGuard>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredRoles?.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No roles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by creating your first role'}
          </p>
          <PermissionGuard permission="settings.roles.create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </PermissionGuard>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.displayName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteRole.isPending}
            >
              {deleteRole.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
