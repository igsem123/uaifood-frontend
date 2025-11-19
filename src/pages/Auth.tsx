import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useToast} from "@/hooks/use-toast";
import {z} from "zod";
import logo from "@/assets/logo.svg";
import {useAuth} from "@/hooks/use-auth.ts";
import * as React from "react";
import {FrontendError} from "@/types/frontendError.ts";
import {Header} from "@/components/Header.tsx";
import {Footer} from "@/components/Footer.tsx";
import {useState} from "react";
import {CheckCircle2, Lock} from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    password: z
        .string()
        .min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
        .max(100, { message: "A senha deve ter menos de 100 caracteres" })
        .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula" })
        .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula" })
        .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número" })
        .regex(/[^A-Za-z0-9]/, { message: "A senha deve conter pelo menos um caractere especial" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export default function Auth() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {login, signup, isLoading} = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            loginSchema.parse({email, password});

            await login(email, password);

            toast({
                title: "Login realizado com sucesso!",
            });
            navigate("/");
        } catch (err: unknown) {
            const error = err as FrontendError;

            if (error.type === "validation") {
                error.messages.forEach((m) => {
                    toast({
                        title: "Erro no login",
                        description: m,
                        variant: "destructive",
                    });
                });
            } else if (error.type === "api") {
                toast({
                    title: "Erro no login",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;

        try {
            signupSchema.parse({email, password, confirmPassword, name, phone});

            await signup(email, password, name, phone);

            toast({
                title: "Cadastro realizado!",
                description: "Você já pode fazer login",
            });

            setPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            const err = error as FrontendError;
            console.error("Signup error:", err);

            if (err.type === "validation") {
                err.messages.forEach((m) => {
                    toast({
                        title: "Erro no cadastro",
                        description: m,
                        variant: "destructive",
                    });
                });
            } else if (err.type === "api") {
                toast({
                    title: "Erro no cadastro",
                    description: err.message,
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div className={"flex flex-col min-h-screen bg-muted"}>
            <Header/>
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <img src={logo} alt="UaiFood" className="size-1/2"/>
                        </div>
                        <div>
                            <CardDescription>Entre ou cadastre-se para continuar</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Entrar</TabsTrigger>
                                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            name="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Senha</Label>
                                        <Input
                                            id="login-password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Entrando..." : "Entrar"}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Nome</Label>
                                        <Input
                                            id="signup-name"
                                            name="name"
                                            type="text"
                                            placeholder="Seu nome"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-phone">Telefone</Label>
                                        <Input
                                            id="signup-phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="(31) 99999-9999"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            name="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="signup-password"
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
                                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
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
                                        <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="signup-confirm-password"
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
                                            <p className="text-sm text-destructive">As senhas não coincidem</p>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Cadastrando..." : "Cadastrar"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <Footer/>
        </div>
    );
}
