import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useToast} from "@/hooks/use-toast";
import {Loader2} from "lucide-react";
import {useState} from "react";
import {Address} from "@/types/address.ts";
import {createAddress, updateAddress} from "@/api/addressApi.ts";
import {FrontendError} from "@/types/frontendError.ts";

export const addressSchema = z.object({
    street: z.string().min(3, "Rua deve ter no mínimo 3 caracteres"),
    number: z.string().min(1, "Número é obrigatório"),
    district: z.string().min(2, "Bairro deve ter no mínimo 2 caracteres"),
    city: z.string().min(2, "Cidade deve ter no mínimo 2 caracteres"),
    state: z.string().length(2, "Estado deve ter 2 caracteres"),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    address?: Address | null;
    userId: string;
    onSuccess: () => void;
}

export function AddressDialog({open, onOpenChange, address, userId, onSuccess}: AddressDialogProps) {
    const {toast} = useToast();
    const [saving, setSaving] = useState(false);

    const form = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        values: address || {
            street: "",
            number: "",
            district: "",
            city: "",
            state: "",
            zipCode: "",
        },
    });

    const onSubmit = async (data: AddressFormData) => {
        setSaving(true);

        if (address?.id) {
            try {
                await updateAddress(address.id, {
                    street: data.street,
                    number: data.number,
                    district: data.district,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                });

                toast({
                    title: "Endereço atualizado",
                    description: "Seu endereço foi salvo com sucesso.",
                });
                onSuccess();
                onOpenChange(false);
            } catch (error) {
                toast({
                    title: "Erro ao salvar",
                    description: "Não foi possível atualizar o endereço.",
                    variant: "destructive",
                });
            }
        } else {
            try {
                await createAddress({
                    street: data.street,
                    number: data.number,
                    district: data.district,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode
                });

                toast({
                    title: "Endereço criado",
                    description: "Seu endereço foi salvo com sucesso.",
                });
                onSuccess();
                onOpenChange(false);
            } catch (error) {
                const err = error as FrontendError;


                toast({
                    title: "Erro ao salvar",
                    description: "Não foi possível criar o endereço.",
                    variant: "destructive",
                });
            }
        }
        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{address ? "Editar Endereço" : "Novo Endereço"}</DialogTitle>
                    <DialogDescription>
                        {address ? "Atualize as informações do endereço" : "Adicione um novo endereço de entrega"}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="street"
                                render={({field}) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Rua</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="number"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Número</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="district"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Bairro</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Cidade</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Estado (UF)</FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={2}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>CEP</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Salvar
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}