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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useProductAttributes } from "@/hooks/useProductAttributes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AttributesManagement() {
  const { attributes, loading, createAttribute, createAttributeValue } = useProductAttributes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
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
    } catch (error) {
      console.error('Erro ao criar valor:', error);
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
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => (
                  <Badge key={value.id} variant="secondary">
                    {value.value}
                  </Badge>
                ))}
                {attribute.values.length === 0 && (
                  <p className="text-muted-foreground">Nenhum valor cadastrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
}