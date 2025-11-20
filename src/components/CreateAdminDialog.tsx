import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { CheckCircle2, Lock, Plus, UserPlus } from "lucide-react";
import { FrontendError } from "@/types/frontendError";
import { registerAdminUser } from "@/api/userApi";
import {signupSchema} from "@/pages/Auth.tsx";

interface CreateAdminDialogProps {
    onSuccess?: () => void;
}

export function CreateAdminDialog({ onSuccess }: CreateAdminDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { toast } = useToast();

    const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string;
        const passwordInput = formData.get("password") as string;
        const confirmPasswordInput = formData.get("confirmPassword") as string;

        try {
            signupSchema.parse({
                name,
                phone,
                email,
                password: passwordInput,
                confirmPassword: confirmPasswordInput
            });

            await registerAdminUser( name, passwordInput, email, phone);

            toast({
                title: "Administrador criado!",
                description: "O novo usuário administrativo foi cadastrado com sucesso.",
            });

            setIsOpen(false);
            setPassword("");
            setConfirmPassword("");
            if (onSuccess) onSuccess();

        } catch (error: unknown) {
            const err = error as FrontendError;

            if (err instanceof z.ZodError) {
                // Tratamento para erros diretos do Zod se não capturados antes
                err.errors.forEach((issue) => {
                    toast({
                        title: "Erro de validação",
                        description: issue.message,
                        variant: "destructive",
                    });
                });
            } else if (err.type === "validation") {
                err.messages.forEach((m) => {
                    toast({
                        title: "Erro de validação",
                        description: m,
                        variant: "destructive",
                    });
                });
            } else if (err.type === "api") {
                toast({
                    title: "Erro ao criar admin",
                    description: err.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro desconhecido",
                    description: "Verifique os dados e tente novamente.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if(!open) {
                setPassword("");
                setConfirmPassword("");
            }
        }}>
            <DialogTrigger asChild>
                <Button className="mb-4 bg-gray-500 hover:bg-gray-600 text-white">
                    <UserPlus className="mr-2 h-4 w-4" /> Novo Administrador
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Administrador</DialogTitle>
                    <DialogDescription>
                        Crie um novo usuário com privilégios de acesso ao dashboard.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateAdmin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-name">Nome Completo</Label>
                        <Input id="admin-name" name="name" placeholder="Nome do administrador" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-phone">Telefone</Label>
                        <Input id="admin-phone" name="phone" type="tel" placeholder="(00) 00000-0000" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-email">Email Corporativo</Label>
                        <Input id="admin-email" name="email" type="email" placeholder="admin@uaifood.com" required />
                    </div>

                    {/* Seção de Senha idêntica ao Auth.tsx */}
                    <div className="space-y-2">
                        <Label htmlFor="admin-password">Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="admin-password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Validadores visuais */}
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                            <li className="flex items-center gap-1">
                                <CheckCircle2 className={`h-3 w-3 ${password.length >= 8 ? 'text-green-500' : ''}`} />
                                Mínimo de 8 caracteres
                            </li>
                            <li className="flex items-center gap-1">
                                <CheckCircle2 className={`h-3 w-3 ${/[A-Z]/.test(password) ? 'text-green-500' : ''}`} />
                                Uma letra maiúscula
                            </li>
                            <li className="flex items-center gap-1">
                                <CheckCircle2 className={`h-3 w-3 ${/[a-z]/.test(password) ? 'text-green-500' : ''}`} />
                                Uma letra minúscula
                            </li>
                            <li className="flex items-center gap-1">
                                <CheckCircle2 className={`h-3 w-3 ${/[0-9]/.test(password) ? 'text-green-500' : ''}`} />
                                Um número
                            </li>
                            <li className="flex items-center gap-1">
                                <CheckCircle2 className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}`} />
                                Um caractere especial
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="admin-confirm-password">Confirmar Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="admin-confirm-password"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-sm text-destructive font-medium">As senhas não coincidem</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Criando..." : "Criar Administrador"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}