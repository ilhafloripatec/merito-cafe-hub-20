import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useProductAttributes } from "@/hooks/useProductAttributes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export function AttributesManagement() {
  const { 
    attributes, 
    loading, 
    createAttribute, 
    updateAttribute, 
    deleteAttribute, 
    createAttributeValue,
    updateAttributeValue,
    deleteAttributeValue
  } = useProductAttributes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editValueDialogOpen, setEditValueDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [attributeForm, setAttributeForm] = useState({
    name: "",
    slug: "",
    type: "select"
  });
  const [valueForm, setValueForm] = useState({
    value: "",
    slug: ""
  });

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAttribute(attributeForm);
      setAttributeForm({ name: "", slug: "", type: "select" });
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar atributo:', error);
    }
  };

  const handleCreateValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttribute) return;

    try {
      await createAttributeValue({
        attribute_id: selectedAttribute,
        ...valueForm
      });
      setValueForm({ value: "", slug: "" });
      setValueDialogOpen(false);
      setSelectedAttribute(null);
      toast({
        title: "Sucesso",
        description: "Valor criado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao criar valor:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar valor.",
        variant: "destructive"
      });
    }
  };

  const handleEditAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttribute) return;

    try {
      await updateAttribute(editingAttribute.id, attributeForm);
      setAttributeForm({ name: "", slug: "", type: "select" });
      setEditDialogOpen(false);
      setEditingAttribute(null);
      toast({
        title: "Sucesso",
        description: "Atributo atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar atributo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar atributo.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    try {
      await deleteAttribute(id);
      toast({
        title: "Sucesso",
        description: "Atributo excluído com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir atributo:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir atributo.",
        variant: "destructive"
      });
    }
  };

  const handleEditValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingValue) return;

    try {
      await updateAttributeValue(editingValue.id, valueForm);
      setValueForm({ value: "", slug: "" });
      setEditValueDialogOpen(false);
      setEditingValue(null);
      toast({
        title: "Sucesso",
        description: "Valor atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar valor.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteValue = async (id: string) => {
    try {
      await deleteAttributeValue(id);
      toast({
        title: "Sucesso",
        description: "Valor excluído com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir valor:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir valor.",
        variant: "destructive"
      });
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (loading) {
    return <div>Carregando atributos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Atributos</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Atributo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Atributo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAttribute} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={attributeForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setAttributeForm({
                      ...attributeForm,
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={attributeForm.slug}
                  onChange={(e) => setAttributeForm({ ...attributeForm, slug: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Criar Atributo</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {attributes.map((attribute) => (
          <Card key={attribute.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{attribute.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAttribute(attribute);
                      setAttributeForm({
                        name: attribute.name,
                        slug: attribute.slug,
                        type: attribute.type
                      });
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Atributo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este atributo? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAttribute(attribute.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAttribute(attribute.id);
                      setValueDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Valor
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => (
                  <div key={value.id} className="flex items-center gap-1">
                    <Badge variant="secondary" className="cursor-pointer">
                      {value.value}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingValue(value);
                        setValueForm({
                          value: value.value,
                          slug: value.slug
                        });
                        setEditValueDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Valor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o valor "{value.value}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteValue(value.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
                {attribute.values.length === 0 && (
                  <p className="text-muted-foreground">Nenhum valor cadastrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para adicionar valor */}
      <Dialog open={valueDialogOpen} onOpenChange={setValueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Valor ao Atributo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateValue} className="space-y-4">
            <div>
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                value={valueForm.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setValueForm({
                    ...valueForm,
                    value,
                    slug: generateSlug(value)
                  });
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="valueSlug">Slug</Label>
              <Input
                id="valueSlug"
                value={valueForm.slug}
                onChange={(e) => setValueForm({ ...valueForm, slug: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Adicionar Valor</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar atributo */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Atributo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAttribute} className="space-y-4">
            <div>
              <Label htmlFor="editName">Nome</Label>
              <Input
                id="editName"
                value={attributeForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setAttributeForm({
                    ...attributeForm,
                    name,
                    slug: generateSlug(name)
                  });
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="editSlug">Slug</Label>
              <Input
                id="editSlug"
                value={attributeForm.slug}
                onChange={(e) => setAttributeForm({ ...attributeForm, slug: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Atualizar Atributo</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar valor */}
      <Dialog open={editValueDialogOpen} onOpenChange={setEditValueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Valor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditValue} className="space-y-4">
            <div>
              <Label htmlFor="editValue">Valor</Label>
              <Input
                id="editValue"
                value={valueForm.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setValueForm({
                    ...valueForm,
                    value,
                    slug: generateSlug(value)
                  });
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="editValueSlug">Slug</Label>
              <Input
                id="editValueSlug"
                value={valueForm.slug}
                onChange={(e) => setValueForm({ ...valueForm, slug: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Atualizar Valor</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}