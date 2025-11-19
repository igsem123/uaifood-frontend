import {LayoutDashboard, ShoppingCart, User} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "./ui/button";
import logo from "@/assets/logo.svg";
import {useEffect, useState} from "react";
import {NotificationsPopover} from "./NotificationsPopover";
import {useAuth} from "@/hooks/use-auth.ts";
import {UserType} from "@/types/user.ts";

interface HeaderProps {
    cartItemsCount?: number;
}

export const Header = ({ cartItemsCount = 0 }: HeaderProps) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const {user} = useAuth();
    const isAuthenticated = !!user;

    useEffect(() => {
        const checkAdminRole = async () => {
            if (!isAuthenticated) {
                setIsAdmin(false);
                return;
            }

            if (!user) return;

            console.log(user);

            if (!user.type || user.type !== UserType.ADMIN) {
                setIsAdmin(false);
                return;
            }

            setIsAdmin(true);
        };

        checkAdminRole();
    }, [isAuthenticated, user]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-20 items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="UaiFood" className="h-16 w-16" />
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
                                        Gerenciar
                                    </Button>
                                </Link>
                            )}
                            <NotificationsPopover userId={user.id} />
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
