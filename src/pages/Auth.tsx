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

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = loginSchema.extend({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    phone: z.string().min(10, "Telefone inválido"),
});

export default function Auth() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {login, signup, isLoading} = useAuth();

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
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return toast({
                    title: "Erro no login",
                    description: error.errors.map((err) => err.message).join(", "),
                    variant: "destructive",
                });
            } else if (error instanceof Error) {
                toast({
                    title: "Erro no login",
                    description: error.message || "Verifique suas credenciais",
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
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;

        try {
            signupSchema.parse({email, password, name, phone});

            await signup(email, password, name, phone);

            toast({
                title: "Cadastro realizado!",
                description: "Você já pode fazer login",
            });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return toast({
                    title: "Erro no cadastro",
                    description: error.errors.map((err) => err.message).join(", "),
                    variant: "destructive",
                });
            } else if (error instanceof Error) {
                toast({
                    title: "Erro no cadastro",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <img src={logo} alt="UaiFood" className="h-16 w-16"/>
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold text-primary">UaiFood</CardTitle>
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
                                    <Input
                                        id="signup-password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••"
                                        required
                                    />
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
    );
}
