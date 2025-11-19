import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserRolesBadges } from '@/components/shared/UserRolesBadges';
import { Calendar, Mail, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface UserDetailsDialogProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    roles: ('student' | 'teacher')[];
    is_super_admin: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog = ({ user, open, onOpenChange }: UserDetailsDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dettagli Utente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
              <p className="text-base font-semibold">
                {user.first_name} {user.last_name}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user.email}</p>
            </div>
          </div>

          {/* Roles */}
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Ruoli</p>
              <div className="flex items-center gap-2 flex-wrap">
                <UserRolesBadges roles={user.roles} />
                {user.is_super_admin && (
                  <Badge variant="destructive" className="gap-1.5">
                    <Shield className="w-3 h-3" />
                    Super Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Registration Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Data Registrazione</p>
              <p className="text-base">
                {format(new Date(user.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
              </p>
            </div>
          </div>

          {/* User ID (for admins) */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">ID Utente</p>
            <p className="text-xs font-mono mt-1 break-all">{user.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
