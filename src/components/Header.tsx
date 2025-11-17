import { ShoppingCart, User, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "@/assets/logo.svg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsPopover } from "./NotificationsPopover";

interface HeaderProps {
  cartItemsCount?: number;
  isAuthenticated?: boolean;
}

export const Header = ({ cartItemsCount = 0, isAuthenticated = false }: HeaderProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setUserId(null);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, [isAuthenticated]);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="UaiFood" className="h-10 w-10" />
          <span className="text-2xl font-bold text-primary">UaiFood</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Cardápio</Button>
          </Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <NotificationsPopover userId={userId} />
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/auth">
              <Button>Entrar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
